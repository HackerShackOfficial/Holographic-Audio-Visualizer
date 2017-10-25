import flicklib
import requests

host = 'http://<HOST_IP>:3000'
volume = 1000

@flicklib.flick()
def flick(start, finish):
	try:
		direction = start + '-' + finish
		print(direction)
		if direction == 'west-east':
			requests.get(host + '/next')
		elif direction == 'east-west':
			requests.get(host + '/prev')
		elif direction == 'south-north':
			requests.get(host + '/toggleVis')
		elif direction == 'north-south':
			requests.get(host + '/changeVis')
	except:
		print "Error connecting to host"

@flicklib.double_tap()
def dt(position):
	try:
		print('double-tap: ' + position)
		requests.get(host + '/toggle')
	except:
		print "Error connecting to host"

@flicklib.airwheel()
def wheel(delta):
	try:
		global volume
		volume += delta
		if volume > 1000:
			volume = 1000
		if volume < 0:
			volume = 0
		r_volume = str(volume/10)
		print('volume: ' + r_volume)
		requests.get(host + '/volume?level=' + r_volume)
	except:
		print "Error connecting to host"

while True:
	pass
