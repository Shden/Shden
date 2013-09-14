#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim:set et tabstop=4 shiftwidth=4 nu nowrap fileencoding=utf-8:

import sys
import os
import subprocess
from twisted.python import log
from twisted.internet import reactor
from zope.interface import implements
from ConfigParser import ConfigParser as Conf

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import devicehive
import devicehive.poll
import devicehive.ws
import devicehive.auto
import devicehive.device.ws
import devicehive.interfaces

class SHDHConnector(object):
    
    	implements(devicehive.interfaces.IProtoHandler)
    
	def init_device_info(self):
		return devicehive.DeviceInfo(id = '0204eede-2297-11e2-882c-e0cb4eb92129',
			key = 'SHDHC01',
			name = 'SH DH Connector',
			status = 'Online',
			network = devicehive.Network(key = 'SHN01',
				name = 'SH Network',
				descr = 'SH Network'),
			device_class = devicehive.DeviceClass(name = 'SHDH Class',
				version = '1.0',
				is_permanent = False),
			equipment = [devicehive.Equipment(name = 'SHDH Equipment',
				code = 'SHDHEQ01',
				type = 'SHDHEQ Type')])

	def __init__(self):
		self.factory = None
		self.connected = False
		self.led_state = 0
		self.DEVICE_INFO = self.init_device_info()
    
	def on_apimeta(self, websocket_server, server_time):
		pass
    
	def on_closing_connection(self):
		pass
    
	def on_connection_failed(self, reason):
		pass
    
	def on_failure(self, device_id, reason):
        	pass
    
	def on_connected(self):
        	def on_subscribe(result) :
            		self.connected = True
            		def on_subsc(res):
                		print 'Subscribed successfully'
            		self.factory.subscribe(self.DEVICE_INFO.id, self.DEVICE_INFO.key).addCallback(on_subsc)
        	def on_failed(reason) :
            		log.err('Failed to save device {0}. Reason: {1}.'.format(self.DEVICE_INFO.id, reason))
        	self.factory.device_save(self.DEVICE_INFO).addCallbacks(on_subscribe, on_failed)
    
	def on_command(self, device_id, command, finished):
		if command.command == 'GetHeatingLog':
			self.do_get_heating_log(finished, **command.parameters)
		elif command.command == 'GetHeatingConfig':
			self.do_get_heating_config(finished, **command.parameters)
		elif command.command == 'SetHeatingSchedule':
			self.do_set_heating_schedule(finished, **command.parameters)
		else :
			finished.errback(NotImplementedError('Unknown command {0}.'.format(command.command)))
    
	def do_get_heating_log(self, finish_deferred):
		output = subprocess.check_output(['tail', '/home/den/Shden/shc/log/heating.log'])
		finish_deferred.callback(devicehive.CommandResult('Done', output))

	def do_get_heating_config(self, finish_deferred):
		output = subprocess.check_output(['cat', '/home/den/Shden/shc/heating_config/controller.ini'])
		finish_deferred.callback(devicehive.CommandResult('Done', output))
    
	def do_set_heating_schedule(self, finish_deferred, arrival_date, arrival_hour, dep_date, dep_hour):
		config = Conf()
		config.read('/home/den/Shden/shc/heating_config/controller.ini')
		config.set('schedule', 'arrive_date', '"' + arrival_date + '"')
		config.set('schedule', 'arrive_hour', '"' + arrival_hour + '"')
		config.set('schedule', 'dep_date', '"' + dep_date + '"')
		config.set('schedule', 'dep_hour', '"' + dep_hour + '"')
		with open('/home/den/Shden/shc/heating_config/controller.ini', 'w') as configFile:
			config.write(configFile)

		output = subprocess.check_output(['cat', '/home/den/Shden/shc/heating_config/controller.ini'])
		finish_deferred.callback(devicehive.CommandResult('Done', output))

	def status_notify(self):
		if self.connected :
			self.factory.notify('equipment', {'equipment': 'LED', 'state': self.led_state}, self.info.id, self.info.key)


if __name__ == '__main__':
	log.startLogging(sys.stdout)
	# read conf-file
	#conf = Conf()
	#conf.read(os.path.join(os.path.dirname(__file__), os.path.splitext(os.path.basename(__file__))[0] + '.cfg'))

	# create device-delegate instance
    	connector = SHDHConnector()

	# Automacti factory
	# Also it is possible to use C{devicehive.poll.PollFactory} or C{devicehive.ws.WebSocketFactory}
	# virt_led_factory = devicehive.auto.AutoFactory(virt_led)
	#virt_led_factory = devicehive.device.ws.WebSocketFactory(virt_led)
	connector_factory = devicehive.poll.PollFactory(connector)
    
	# Send notification right after registration
    	connector.status_notify()
    
	# Connect to device-hive
    	# connector_factory.connect('ws://nn575.pg.devicehive.com:8010')
    	connector_factory.connect('http://nn575.pg.devicehive.com/api/')
	reactor.run()
