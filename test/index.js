'use strict'

const assert = require( 'assert' )
const fs = require( 'fs' )
const Adapter = require( '../index' )
const adapter = Adapter()
const parse5 = require( 'parse5' )

fs.readFile( './test/document.html', 'utf8', ( err, html ) => {
  if( err ) throw err

  const domonTree = parse5.parse( html, { treeAdapter: adapter } )

  assert( Array.isArray( domonTree ) )
})