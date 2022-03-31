# crowdloan contributions exporter

This is a script to export contributions data for crowdloans that contributed through parallel.

## Usage

Current Crowdloan via prallel supports Polkadot and Kusama platforms, please confirm which platform you want to export to.

### Polkadot

`yarn && yarn polkadot-v1`

Then you can get the latest data file of `dot_contributions.csv` in root directory.

### Kusama

`yarn && yarn kusama-v2`

Then you can get the latest data file of `ksm_via_heiko_contributions.csv` in root directory.

#### Optional(rich)

`yarn && yarn kusama-v2-rich`

This action will search for transactions that occur in relay chains(Kusama), since it is a search action, it will initiate a large number of api-requests, which may take a long time, so if you don't care when it happend in relaychain, you can ignore this action.

> if some transactions are not found, we can expand the search range, i.e. adjust the searchRange interval in `config.json`(crowdloan-via-heiko.searchRange)

##### How to get the relaychain block height of crowdloan via heiko

![kusama-v2](https://cdn.jsdelivr.net/gh/rjman-ljm/resources@master/assets/1648643844371kusama-v2-exporter.jpg)
