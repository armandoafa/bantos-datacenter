#!/bin/bash
echo "Building Payment Webview..."
npm run build

echo "Syncing to VPS..."
sshpass -p "4p1B4nt0sC10ud26#" rsync -avz --exclude 'node_modules' -e "ssh -o StrictHostKeyChecking=no" ./ root@72.62.128.126:/var/www/bantos.cloud/bantos-datacenter/payment-webview/

echo "Done!"
