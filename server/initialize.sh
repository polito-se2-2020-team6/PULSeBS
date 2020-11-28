#!/bin/bash 
/usr/local/bin/gomplate -f /msmtprc.tmpl -o /etc/msmtprc

apachectl start
cron && tail -f /var/log/cron.log
