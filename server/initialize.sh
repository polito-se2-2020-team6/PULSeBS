#!/bin/bash 
apachectl start
cron && tail -f /var/log/cron.log
