#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: ./decrypt.sh <password>"
    exit 1
fi

openssl enc -aes-256-cbc -d -in mastering-chain.enc -out mastering-chain-decrypted.md -k "$1" -pbkdf2