import bluepy.btle as btle

import json
import hashlib
import sys

def to_node(type, message):
	# convert to json and print (node helper will read from stdout)
	try:
		print(json.dumps({type: message}))
	except Exception:
		pass
	# stdout has to be flushed manually to prevent delays in the node helper communication
	sys.stdout.flush()

class MyDelegate(btle.DefaultDelegate):
    def __init__(self):
        btle.DefaultDelegate.__init__(self)

    def handleNotification(self, cHandle, data):
        #print("A notification was received: %s" %data)
        data = interpret(data)
        #print(data)
        to_node('HR', data["hr"])


def interpret(data):
    """
    data is a list of integers corresponding to readings from the BLE HR monitor
    """

    byte0 = data[0]
    res = {}
    res["hrv_uint8"] = (byte0 & 1) == 0
    sensor_contact = (byte0 >> 1) & 3
    if sensor_contact == 2:
        res["sensor_contact"] = "No contact detected"
    elif sensor_contact == 3:
        res["sensor_contact"] = "Contact detected"
    else:
        res["sensor_contact"] = "Sensor contact not supported"
    res["ee_status"] = ((byte0 >> 3) & 1) == 1
    res["rr_interval"] = ((byte0 >> 4) & 1) == 1

    if res["hrv_uint8"]:
        res["hr"] = data[1]
        i = 2
    else:
        res["hr"] = (data[2] << 8) | data[1]
        i = 3

    if res["ee_status"]:
        res["ee"] = (data[i + 1] << 8) | data[i]
        i += 2

    if res["rr_interval"]:
        res["rr"] = []
        while i < len(data):
            # Note: Need to divide the value by 1024 to get in seconds
            res["rr"].append((data[i + 1] << 8) | data[i])
            i += 2

    return res
try:
    p = btle.Peripheral("D0:C7:92:78:89:C0", btle.ADDR_TYPE_RANDOM)    
#p = btle.Peripheral("c1:62:85:73:9e:d3", btle.ADDR_TYPE_RANDOM)    
except btle.BTLEException as e:
    print(e.code)
    print(e.message)


p.setDelegate( MyDelegate() )

# Setup to turn notifications on, e.g.
svc = p.getServiceByUUID(0x180d)
ch = svc.getCharacteristics()[0]
#print(ch.valHandle)

p.writeCharacteristic(ch.valHandle+1, b"\x01\x00")

while True:
    if p.waitForNotifications(1.0):
        # handleNotification() was called
        continue

    #print("Waiting...")
    # Perhaps do something else here
