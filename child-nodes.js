'use strict'

const predicates = require( './predicates' )
const nodeType = require( 'nodetype-enum' )

const nodeTypeIs = nodeTypes.NodeTypeIs( predicates )

const getElementChildNodeIndex = node =>
  Array.isArray( node[ 2 ] ) ? 2 : Array.isArray( node[ 1 ] ) ? 1 : node.length

const getChildNodeIndex = {
  element: getElementChildNodeIndex,
  document: getElementChildNodeIndex,
  documentFragment: node => 0
}

const getElementChildNodes = node => {
  let index = getChildNodeIndex.element( node )

  if( !Array.isArray( node[ index ] ) ){
    node[ index ] = []
  }

  return node[ index ]
}

const getChildNodes = {
  element: getElementChildNodes,
  document: getElementChildNodes,
  documentFragment: node => node[ 0 ]
}

const setElementChildNodes = ( node, children ) => node[ getChildNodeIndex.element( node ) ] = children

const setChildNodes = {
  element: setElementChildNodes,
  document: setElementChildNodes,
  documentFragment: ( node, children ) => node[ 0 ] = children
}

const childNodes = ( parentNode, children ) => {
  const nodeType = nodeTypeIs( parentNode )

  if( Array.isArray( children ) ){
    return setChildNodes[ nodeType ]( parentNode, children )
  }

  const getChildren = getChildNodes[ nodeType ]

  if( getChildren instanceof Function )
    return getChildren( parentNode )
}

module.exports = childNodes
