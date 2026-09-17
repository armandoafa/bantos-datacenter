#!/usr/bin/expect -f
set timeout -1
set password "4p1B4nt0sC10ud26#"
spawn rsync -avz client/dist/ root@72.62.128.126:/var/www/bantos.cloud/bantos-datacenter/client/dist/
expect {
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    "password:" {
        send "$password\r"
    }
}
expect eof
