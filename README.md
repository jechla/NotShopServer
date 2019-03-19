# NotShopServer
Not a shop's server

Dette er server-delen til NotShoppen. Det er en node.js Server, der bruger express, sqlite.

## DER ER INGEN SIKKERHED OVERHOVEDET!

Al data er ukrypteret og passwords, bliver gemt i klartekst. Og al data sendes i klartekst i JSON.

Serveren skal kun bruges til demonstration ikke i produktion!

Installation

1. Download 
2. kopier NotShop.db fra emptydb til roden
3. kør "npm install", for at få alle nødvendige pakker
4. kør "npm start" for at køre NotShopServer

Serveren kører på port 8080. 

Pakker Cors er med for at tillade at NotShoppen og NotShopServer kører på localhost (dvs. samme computer)
