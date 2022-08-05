#!/bin/sh

sudo chown $USER ./chain-setup/**/db-data/ -v
sudo chgrp $USER ./chain-setup/**/db-data/ -v
sudo chown $USER ./chain-setup/**/blockchain-data/ -v
sudo chgrp $USER ./chain-setup/**/blockchain-data/ -v
