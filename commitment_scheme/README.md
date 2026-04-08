If you found this page looking for some information on how I make git commits, you're in the wrong place. This is where I 'call my shots' so to say; if I have an idea/project that I am not ready to release publicly but which I want a public timestamped record of that I can refer to later to show the progression of that idea/project, I'll put it here. 


The `.enc` files are produced using AES-256, specifically via openssl version 3.2.4

To decrypt a file after I've released the secret key, install openssl and run:
`openssl enc -d -aes-256-cbc -pbkdf2 -in <FILENAME>.enc -out revealed.txt -pass pass:<SECRET KEY>`

To verify the unecrypted result is the same as the file I encrypted (i.e. I did not reverse engineer a key that would decrypt the `.enc` file to my desired statement) you can check the hash value matches like so:

`sha256sum commitment_scheme/revealed.txt`

Which should match exactly the hash value in `<FILENAME>_sha256sumHash.txt`, showing that the file has not changed and was known entirely at the time of publishing. 

