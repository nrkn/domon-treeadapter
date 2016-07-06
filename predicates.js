'use strict'

const nodeType = require( 'nodetype-enum' )

const isChildren = obj => Array.isArray( obj ) && obj.length > 0

const isNodeType = ( obj, nodeType ) => isChildren( obj ) && obj[ 0 ] === nodeType

const predicates = {
  element: obj => isChildren( obj ) && typeof obj[ 0 ] === 'string',
  text: obj => typeof obj === 'string',
  processingInstruction: obj => isNodeType( obj, nodeType.processingInstruction ),
  comment: obj => isNodeType( obj, nodeType.comment ),
  document: obj => isNodeType( obj, nodeType.document ),
  documentType: obj => isNodeType( obj, nodeType.documentType ),
  documentFragment: obj => isChildren( obj ) && Array.isArray( obj[ 0 ] )
}

module.exports = predicates
