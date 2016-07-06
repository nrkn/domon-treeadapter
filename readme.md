# domon-treeadapter

## A parse5-compatible TreeAdapter for the DOMON format

See [TreeAdapter at parse5 documentation](https://github.com/inikulin/parse5/wiki/Documentation#TreeAdapter)

The DOMON format is just a lightweight DOM representation with no circular
references, making it suitable for JSON etc.

## Install

`npm install domon-treeadapter`

## Usage

```javascript
const parse5 = require( 'parse5' )

const Adapter = require( 'domon-treeadapter' )

// create an adapter instance
const adapter = Adapter()

const domonTree = parse5.parse( '<div></div>', { treeAdapter: adapter } )
```
