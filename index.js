'use strict'

const predicates = require( './predicates' )
const childNodes = require( './child-nodes' )

const nodeType = require( 'nodetype-enum' )

const attrMap = pairs => pairs.reduce( ( map, pair ) => {
  map[ pair.name ] = pair.value
  return map
}, {})

const attrPairs = map => Object.keys( map ).map( key => ({
  name: key,
  value: map[ key ]
}))

const getAttrMap = element => {
  if( !predicates.element( element ))
    throw new Error( 'Not an element node' )

  if( element[ 1 ] != null && !Array.isArray( element[ 1 ] ) ) return element[ 1 ]
  if( element[ 2 ] != null && !Array.isArray( element[ 2 ] ) ) return element[ 2 ]

  const attr = {}

  element.splice( 1, 0, attr )

  return attr
}

const Adapter = () => {
  const parent = new Map()

  const adapter = {
    createDocument: () => [ nodeType.document, '', [] ],

    createDocumentFragment: () => [[]],

    createElement: ( tagName, nameSpaceUri, attrs ) => {
      const element = [ tagName.toLowerCase() ]

      if( Array.isArray( attrs ) && attrs.length )
        element.push( attrMap( attrs ) )

      return element
    },

    createCommentNode: data => [ nodeType.comment, data ],

    appendChild: ( parentNode, newNode ) => {
      const children = childNodes( parentNode )

      if( !Array.isArray( children ) )
        throw new Error( 'Parent node does not accept children' )

      children.push( newNode )

      parent.set( newNode, parentNode )
    },

    insertBefore: ( parentNode, newNode, referenceNode ) => {
      const children = childNodes( parentNode )

      if( !Array.isArray( children ) )
        throw new Error( 'Parent node does not accept children' )

      const index = children.indexOf( referenceNode )

      if( index === -1 )
        throw new Error( 'Reference node not found' )

      children.splice( index, 0, newNode )

      parent.set( newNode, parentNode )
    },

    setTemplateContent: ( templateElement, documentFragment ) => {
      childNodes( templateElement, documentFragment[ 0 ] )
    },

    getTemplateContent: templateElement => {
      return childNodes( templateElement )
    },

    setDocumentType: ( document, name, publicId, systemId ) => {
      if( !predicates.document( document ) )
        throw new Error( 'Not a document' )

      const children = childNodes( document )

      let documentType = children.find( predicates.documentType )

      if( !documentType ){
        documentType = [ nodeType.documentType ]
        childNodes( document, [ documentType ].concat( children ) )
        parent.set( documentType, document )
      }

      documentType[ 1 ] = name
      documentType[ 2 ] = publicId || ''
      documentType[ 3 ] = systemId || ''
    },

    setQuirksMode: document => {},

    isQuirksMode: document => false,

    detachNode: node => {
      const parentNode = parent.get( node )

      if( !parentNode )
        throw new Error( 'Node is already unattached' )

      const children = childNodes( parentNode )

      if( !Array.isArray( children ) )
        throw new Error( 'Parent node does not accept children' )

      const newChildren = children.filter( n => n !== node )

      childNodes( parentNode, newChildren )

      parent.delete( node )

      return node
    },

    insertText: ( parentNode, text ) => {
      if( predicates.comment( parentNode ) ){
        parentNode[ 1 ] += text

        return
      }

      const children = childNodes( parentNode )

      if( !Array.isArray( children ) )
        throw new Error( 'Parent node does not accept children' )

      const existing = children[ children.length - 1 ]
      const isLastText = predicates.text( existing )

      if( isLastText ){
        text = existing + text

        adapter.detachNode( existing )
      }

      adapter.appendChild( parentNode, text )

      return text
    },

    insertTextBefore: ( parentNode, text, referenceNode ) => {
      const children = childNodes( parentNode )

      if( !Array.isArray( children ) )
        throw new Error( 'Parent node does not accept children' )

      const index = children.indexOf( referenceNode )

      if( index === -1 )
        throw new Error( 'Reference node not found' )

      const reference = children[ index ]
      const isRefText = predicates.text( reference )

      if( isRefText ){
        text = text + reference

        adapter.detachNode( reference )
      }

      children.splice( index, 0, text )

      parent.set( text, parentNode )

      return text
    },

    adoptAttributes: ( recipientNode, attrs ) => {
      const existing = getAttrMap( recipientNode )

      attrs.filter( pair => !pair.name in existing ).forEach( pair => {
        existing[ pair.name ] = pair.value
      })
    },

    getFirstChild: node => {
      const children = childNodes( node )

      if( !Array.isArray( children ) )
        throw new Error( 'Parent node does not accept children' )

      if( children.length > 0 )
        return children[ 0 ]
    },

    getChildNodes: childNodes,

    getParentNode: node => parent.get( node ),

    getAttrList: node => attrPairs( getAttrMap( node ) ),

    getTagName: element => {
      if( !predicates.element( element ) )
        throw new Error( 'Not an element' )

      return element[ 0 ]
    },

    getNamespaceURI: element => 'http://www.w3.org/1999/xhtml',

    getTextNodeContent: textNode => {
      if( !predicates.text( textNode ) )
        throw new Error( 'Not a text node' )

      return textNode
    },

    getCommentNodeContent: commentNode => {
      if( !predicates.comment( commentNode ) )
        throw new Error( 'Not a comment node' )

      return commentNode[ 1 ]
    },

    getDocumentTypeNodeName: doctypeNode => {
      if( !predicates.documentType( doctypeNode ) )
        throw new Error( 'Not a document type node' )

      return doctypeNode[ 1 ]
    },

    getDocumentTypeNodePublicId: doctypeNode => {
      if( !predicates.documentType( doctypeNode ) )
        throw new Error( 'Not a document type node' )

      return doctypeNode[ 2 ]
    },

    getDocumentTypeNodeSystemId: doctypeNode => {
      if( !predicates.documentType( doctypeNode ) )
        throw new Error( 'Not a document type node' )

      return doctypeNode[ 3 ]
    },

    isTextNode: predicates.text,

    isCommentNode: predicates.comment,

    isDocumentTypeNode: predicates.documentType,

    isElementNode: predicates.element
  }

  return adapter
}

module.exports = Adapter
