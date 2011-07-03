// The definitions of the basic types in Whalesong.
//
// Note: this originally came from js-vm, and as a result,
// there's quite a lot of cruft and unused code in this module.
// I need to filter and rip out the values that aren't used in Whalesong.


if (! this['plt']) { this['plt'] = {}; }

// FIXME: there's a circularity between this module and helpers, and that circularly
// should not be there!


(function (scope) {
    //////////////////////////////////////////////////////////////////////
    var types = {};
    scope['types'] = types;


    // helpers refers to plt.helpers.
    var helpers = scope['helpers'];


    var getEqHashCode = helpers.getEqHashCode, 
         // makeLowLevelEqHash: -> hashtable
        // Constructs an eq hashtable that uses Moby's getEqHashCode function.

        makeLowLevelEqHash = helpers.makeLowLevelEqHash;

    var toWrittenString = helpers.toWrittenString;
    var toDisplayedString = helpers.toDisplayedString;
    var toDomNode = helpers.toDomNode;

    scope.link.ready('helpers', function() { 
        helpers = scope['helpers']; 
        getEqHashCode = helpers.getEqHashCode;
        makeLowLevelEqHash = helpers.makeLowLevelEqHash;
        toWrittenString = helpers.toWrittenString;
        toDisplayedString = helpers.toDisplayedString;
        toDomNode = helpers.toDomNode;
    });



    var appendChild = function(parent, child) {
        parent.appendChild(child);
    };


    //////////////////////////////////////////////////////////////////////



    






    //////////////////////////////////////////////////////////////////////















    //////////////////////////////////////////////////////////////////////

    // Regular expressions.

    var RegularExpression = function(pattern) {
        this.pattern = pattern;
    };


    var ByteRegularExpression = function(pattern) {
        this.pattern = pattern;
    };




    //////////////////////////////////////////////////////////////////////

    // Paths

    var Path = function(p) {
        this.path = p;
    };

    Path.prototype.toString = function() {
        return this.path;
    };



    //////////////////////////////////////////////////////////////////////

    // Bytes

    var Bytes = function(bts, mutable) {
        // bytes: arrayof [0-255]
        this.bytes = bts;
        this.mutable = (mutable === undefined) ? false : mutable;
    };

    Bytes.prototype.get = function(i) {
	return this.bytes[i];
    };

    Bytes.prototype.set = function(i, b) {
	if (this.mutable) {
	    this.bytes[i] = b;
	}
    };

    Bytes.prototype.length = function() {
	return this.bytes.length;
    };

    Bytes.prototype.copy = function(mutable) {
	return new Bytes(this.bytes.slice(0), mutable);
    };

    Bytes.prototype.subbytes = function(start, end) {
	if (end == null || end == undefined) {
	    end = this.bytes.length;
	}
	
	return new Bytes( this.bytes.slice(start, end), true );
    };


    Bytes.prototype.equals = function(other) {
        if (! (other instanceof Bytes)) {
	    return false;
        }
        if (this.bytes.length != other.bytes.length) {
	    return false;
        }
        var A = this.bytes;
        var B = other.bytes;
        var n = this.bytes.length;
        for (var i = 0; i < n; i++) {
	    if (A[i] !== B[i])
	        return false;
        }
        return true;
    };


    Bytes.prototype.toString = function(cache) {
	var ret = '';
	for (var i = 0; i < this.bytes.length; i++) {
	    ret += String.fromCharCode(this.bytes[i]);
	}

	return ret;
    };

    Bytes.prototype.toDisplayedString = Bytes.prototype.toString;

    Bytes.prototype.toWrittenString = function() {
	var ret = ['#"'];
	for (var i = 0; i < this.bytes.length; i++) {
	    ret.push( escapeByte(this.bytes[i]) );
	}
	ret.push('"');
	return ret.join('');
    };

    var escapeByte = function(aByte) {
	var ret = [];
	var returnVal;
	switch(aByte) {
	case 7: returnVal = '\\a'; break;
	case 8: returnVal = '\\b'; break;
	case 9: returnVal = '\\t'; break;
	case 10: returnVal = '\\n'; break;
	case 11: returnVal = '\\v'; break;
	case 12: returnVal = '\\f'; break;
	case 13: returnVal = '\\r'; break;
	case 34: returnVal = '\\"'; break;
	case 92: returnVal = '\\\\'; break;
	default: if (aByte >= 32 && aByte <= 126) {
	    returnVal = String.fromCharCode(aByte);
	}
	    else {
		ret.push( '\\' + aByte.toString(8) );
	    }
	    break;
	}
	return returnVal;
    };




    //////////////////////////////////////////////////////////////////////
    // Boxes
    
    var Box = function(x, mutable) {
	this.val = x;
	this.mutable = mutable;
    };

    Box.prototype.ref = function() {
        return this.val;
    };

    Box.prototype.set = function(newVal) {
        if (this.mutable) {
	    this.val = newVal;
        }
    };

    Box.prototype.toString = function(cache) {
        cache.put(this, true);
        return "#&" + toWrittenString(this.val, cache);
    };

    Box.prototype.toWrittenString = function(cache) {
        cache.put(this, true);
        return "#&" + toWrittenString(this.val, cache);
    };

    Box.prototype.toDisplayedString = function(cache) {
        cache.put(this, true);
        return "#&" + toDisplayedString(this.val, cache);
    };

    Box.prototype.toDomNode = function(cache) {
        cache.put(this, true);
        var parent = document.createElement("span");
        parent.appendChild(document.createTextNode('#&'));
        parent.appendChild(toDomNode(this.val, cache));
        return parent;
    };

    Box.prototype.equals = function(other, aUnionFind) {
        return ((other instanceof Box) &&
	        equals(this.val, other.val, aUnionFind));
    };

    //////////////////////////////////////////////////////////////////////

    // Placeholders: same thing as boxes.  Distinct type just to support make-reader-graph.

    var Placeholder = function(x, mutable) {
        this.val = x;
    };

    Placeholder.prototype.ref = function() {
        return this.val;
    };

    Placeholder.prototype.set = function(newVal) {
	this.val = newVal;
    };

    Placeholder.prototype.toString = function(cache) {
        return "#<placeholder>";
    };

    Placeholder.prototype.toWrittenString = function(cache) {
        return "#<placeholder>";
    };

    Placeholder.prototype.toDisplayedString = function(cache) {
        return "#<placeholder>";
    };

    Placeholder.prototype.toDomNode = function(cache) {
        var parent = document.createElement("span");
        parent.appendChild(document.createTextNode('#<placeholder>'));
        return parent;
    };

    Placeholder.prototype.equals = function(other, aUnionFind) {
        return ((other instanceof Placeholder) &&
	        equals(this.val, other.val, aUnionFind));
    };




    //////////////////////////////////////////////////////////////////////




    // Chars
    // Char: string -> Char
    Char = function(val){
        this.val = val;
    };
    // The characters less than 256 must be eq?, according to the
    // documentation:
    // http://docs.racket-lang.org/reference/characters.html
    var _CharCache = {};
    for (var i = 0; i < 256; i++) {
        _CharCache[String.fromCharCode(i)] = new Char(String.fromCharCode(i));
    }
    
    // makeInstance: 1-character string -> Char  
    Char.makeInstance = function(val){
        if (_CharCache[val]) {
	    return _CharCache[val];
        }
        return new Char(val);
    };

    Char.prototype.toString = function(cache) {
	var code = this.val.charCodeAt(0);
	var returnVal;
	switch (code) {
	case 0: returnVal = '#\\nul'; break;
	case 8: returnVal = '#\\backspace'; break;
	case 9: returnVal = '#\\tab'; break;
	case 10: returnVal = '#\\newline'; break;
	case 11: returnVal = '#\\vtab'; break;
	case 12: returnVal = '#\\page'; break;
	case 13: returnVal = '#\\return'; break;
	case 20: returnVal = '#\\space'; break;
	case 127: returnVal = '#\\rubout'; break;
	default: if (code >= 32 && code <= 126) {
	    returnVal = ("#\\" + this.val);
	}
	    else {
		var numStr = code.toString(16).toUpperCase();
		while (numStr.length < 4) {
		    numStr = '0' + numStr;
		}
		returnVal = ('#\\u' + numStr);
	    }
	    break;
	}
	return returnVal;
    };

    Char.prototype.toWrittenString = Char.prototype.toString;

    Char.prototype.toDisplayedString = function (cache) {
        return this.val;
    };

    Char.prototype.getValue = function() {
        return this.val;
    };

    Char.prototype.equals = function(other, aUnionFind){
        return other instanceof Char && this.val == other.val;
    };

    //////////////////////////////////////////////////////////////////////
    
    // Symbols

    //////////////////////////////////////////////////////////////////////
    var Symbol = function(val) {
        this.val = val;
    };

    var symbolCache = {};
    
    // makeInstance: string -> Symbol.
    Symbol.makeInstance = function(val) {
        // To ensure that we can eq? symbols with equal values.
        if (!(val in symbolCache)) {
	    symbolCache[val] = new Symbol(val);
        } else {
        }
        return symbolCache[val];
    };
    
    Symbol.prototype.equals = function(other, aUnionFind) {
        return other instanceof Symbol &&
            this.val == other.val;
    };
    

    Symbol.prototype.toString = function(cache) {
        return this.val;
    };

    Symbol.prototype.toWrittenString = function(cache) {
        return this.val;
    };

    Symbol.prototype.toDisplayedString = function(cache) {
        return this.val;
    };

    //////////////////////////////////////////////////////////////////////

    // Keywords

    var Keyword = function(val) {
        this.val = val;
    };

    var keywordCache = {};
    
    // makeInstance: string -> Keyword.
    Keyword.makeInstance = function(val) {
        // To ensure that we can eq? symbols with equal values.
        if (!(val in keywordCache)) {
	    keywordCache[val] = new Keyword(val);
        } else {
        }
        return keywordCache[val];
    };
    
    Keyword.prototype.equals = function(other, aUnionFind) {
        return other instanceof Keyword &&
            this.val == other.val;
    };
    

    Keyword.prototype.toString = function(cache) {
        return this.val;
    };

    Keyword.prototype.toWrittenString = function(cache) {
        return this.val;
    };

    Keyword.prototype.toDisplayedString = function(cache) {
        return this.val;
    };


    //////////////////////////////////////////////////////////////////////


    
    
    
    Empty = function() {
    };
    Empty.EMPTY = new Empty();


    Empty.prototype.equals = function(other, aUnionFind) {
        return other instanceof Empty;
    };

    Empty.prototype.reverse = function() {
        return this;
    };

    Empty.prototype.toWrittenString = function(cache) { return "empty"; };
    Empty.prototype.toDisplayedString = function(cache) { return "empty"; };
    Empty.prototype.toString = function(cache) { return "()"; };


    
    // Empty.append: (listof X) -> (listof X)
    Empty.prototype.append = function(b){
        return b;
    };
    



    //////////////////////////////////////////////////////////////////////

    // Cons Pairs

    var Cons = function(f, r) {
        this.first = f;
        this.rest = r;
    };

    Cons.prototype.reverse = function() {
        var lst = this;
        var ret = Empty.EMPTY;
        while (!isEmpty(lst)){
	    ret = Cons.makeInstance(lst.first, ret);
	    lst = lst.rest;
        }
        return ret;
    };
    
    Cons.makeInstance = function(f, r) {
        return new Cons(f, r);
    };

    // FIXME: can we reduce the recursion on this?
    Cons.prototype.equals = function(other, aUnionFind) {
        if (! (other instanceof Cons)) {
	    return false;
        }
        return (equals(this.first, other.first, aUnionFind) &&
	        equals(this.rest, other.rest, aUnionFind));
    };
    

    

    // Cons.append: (listof X) -> (listof X)
    Cons.prototype.append = function(b){
        if (b === Empty.EMPTY)
	    return this;
        var ret = b;
        var lst = this.reverse();
        while ( !isEmpty(lst) ) {
	    ret = Cons.makeInstance(lst.first, ret);
	    lst = lst.rest;
        }
	
        return ret;
    };
    

    Cons.prototype.toWrittenString = function(cache) {
        cache.put(this, true);
        var texts = [];
        var p = this;
        while ( p instanceof Cons ) {
	    texts.push(toWrittenString(p.first, cache));
	    p = p.rest;
	    if (typeof(p) === 'object' && cache.containsKey(p)) {
	        break;
	    }
        }
        if ( p !== Empty.EMPTY ) {
	    texts.push('.');
	    texts.push(toWrittenString(p, cache));
        }
        return "(" + texts.join(" ") + ")";
    };

    Cons.prototype.toString = Cons.prototype.toWrittenString;

    Cons.prototype.toDisplayedString = function(cache) {
        cache.put(this, true);
        var texts = [];
        var p = this;
        while ( p instanceof Cons ) {
	    texts.push(toDisplayedString(p.first, cache));
	    p = p.rest;
	    if (typeof(p) === 'object' && cache.containsKey(p)) {
	        break;
	    }
        }
        if ( p !== Empty.EMPTY ) {
	    texts.push('.');
	    texts.push(toDisplayedString(p, cache));
        }
        return "(" + texts.join(" ") + ")";
    };



    Cons.prototype.toDomNode = function(cache) {
        cache.put(this, true);
        var node = document.createElement("span");
        node.appendChild(document.createTextNode("("));
        var p = this;
        while ( p instanceof Cons ) {
	    appendChild(node, toDomNode(p.first, cache));
	    p = p.rest;
	    if ( p !== Empty.EMPTY ) {
	        appendChild(node, document.createTextNode(" "));
	    }
	    if (typeof(p) === 'object' && cache.containsKey(p)) {
	        break;
	    }
        }
        if ( p !== Empty.EMPTY ) {
	    appendChild(node, document.createTextNode("."));
	    appendChild(node, document.createTextNode(" "));
	    appendChild(node, toDomNode(p, cache));
        }

        node.appendChild(document.createTextNode(")"));
        return node;
    };


    // isList: Any -> Boolean
    // Returns true if x is a list (a chain of pairs terminated by EMPTY).
    var isList = function(x) { 
	while (x !== Empty.EMPTY) {
	    if (x instanceof Cons){
		x = x.rest;
	    } else {
		return false;
	    }
	}
	return true;
    };




    //////////////////////////////////////////////////////////////////////

    Vector = function(n, initialElements) {
        this.elts = new Array(n);
        if (initialElements) {
	    for (var i = 0; i < n; i++) {
	        this.elts[i] = initialElements[i];
	    }
        } else {
	    for (var i = 0; i < n; i++) {
	        this.elts[i] = undefined;
	    }
        }
        this.mutable = true;
    };
    Vector.makeInstance = function(n, elts) {
        return new Vector(n, elts);
    }
    Vector.prototype.length = function() {
	return this.elts.length;
    };
    Vector.prototype.ref = function(k) {
        return this.elts[k];
    };
    Vector.prototype.set = function(k, v) {
        this.elts[k] = v;
    };

    Vector.prototype.equals = function(other, aUnionFind) {
        if (other != null && other != undefined && other instanceof Vector) {
	    if (other.length() != this.length()) {
	        return false
	    }
	    for (var i = 0; i <  this.length(); i++) {
	        if (! equals(this.elts[i], other.elts[i], aUnionFind)) {
		    return false;
	        }
	    }
	    return true;
        } else {
	    return false;
        }
    };

    Vector.prototype.toList = function() {
        var ret = Empty.EMPTY;
        for (var i = this.length() - 1; i >= 0; i--) {
	    ret = Cons.makeInstance(this.elts[i], ret);	    
        }	
        return ret;
    };

    Vector.prototype.toWrittenString = function(cache) {
        cache.put(this, true);
        var texts = [];
        for (var i = 0; i < this.length(); i++) {
	    texts.push(toWrittenString(this.ref(i), cache));
        }
        return "#(" + texts.join(" ") + ")";
    };

    Vector.prototype.toDisplayedString = function(cache) {
        cache.put(this, true);
        var texts = [];
        for (var i = 0; i < this.length(); i++) {
	    texts.push(toDisplayedString(this.ref(i), cache));
        }
        return "#(" + texts.join(" ") + ")";
    };

    Vector.prototype.toDomNode = function(cache) {
        cache.put(this, true);
        var node = document.createElement("span");
        node.appendChild(document.createTextNode("#("));
        for (var i = 0; i < this.length(); i++) {
	    appendChild(node,
		        toDomNode(this.ref(i), cache));
	    if (i !== this.length()-1) {
	        appendChild(node, document.createTextNode(" "));
	    }
        }
        node.appendChild(document.createTextNode(")"));
        return node;
    };


    //////////////////////////////////////////////////////////////////////






    // Now using mutable strings
    var Str = function(chars) {
	this.chars = chars;
	this.length = chars.length;
	this.mutable = true;
    }

    Str.makeInstance = function(chars) {
	return new Str(chars);
    }

    Str.fromString = function(s) {
	return Str.makeInstance(s.split(""));
    }

    Str.prototype.toString = function() {
	return this.chars.join("");
    }

    Str.prototype.toWrittenString = function(cache) {
        return escapeString(this.toString());
    }

    Str.prototype.toDisplayedString = Str.prototype.toString;

    Str.prototype.copy = function() {
	return Str.makeInstance(this.chars.slice(0));
    }

    Str.prototype.substring = function(start, end) {
	if (end == null || end == undefined) {
	    end = this.length;
	}
	
	return Str.makeInstance( this.chars.slice(start, end) );
    }

    Str.prototype.charAt = function(index) {
	return this.chars[index];
    }

    Str.prototype.charCodeAt = function(index) {
	return this.chars[index].charCodeAt(0);
    }

    Str.prototype.replace = function(expr, newStr) {
	return Str.fromString( this.toString().replace(expr, newStr) );
    }


    Str.prototype.equals = function(other, aUnionFind) {
	if ( !(other instanceof Str || typeof(other) == 'string') ) {
	    return false;
	}
	return this.toString() === other.toString();
    }


    Str.prototype.set = function(i, c) {
	this.chars[i] = c;
    }

    Str.prototype.toUpperCase = function() {
	return Str.fromString( this.chars.join("").toUpperCase() );
    }

    Str.prototype.toLowerCase = function() {
	return Str.fromString( this.chars.join("").toLowerCase() );
    }

    Str.prototype.match = function(regexpr) {
	return this.toString().match(regexpr);
    }


    //var _quoteReplacingRegexp = new RegExp("[\"\\\\]", "g");
    var escapeString = function(s) {
        return '"' + replaceUnprintableStringChars(s) + '"';
        //    return '"' + s.replace(_quoteReplacingRegexp,
        //			      function(match, submatch, index) {
        //				  return "\\" + match;
        //			      }) + '"';
    };

    var replaceUnprintableStringChars = function(s) {
	var ret = [];
	for (var i = 0; i < s.length; i++) {
	    var val = s.charCodeAt(i);
	    switch(val) {
	    case 7: ret.push('\\a'); break;
	    case 8: ret.push('\\b'); break;
	    case 9: ret.push('\\t'); break;
	    case 10: ret.push('\\n'); break;
	    case 11: ret.push('\\v'); break;
	    case 12: ret.push('\\f'); break;
	    case 13: ret.push('\\r'); break;
	    case 34: ret.push('\\"'); break;
	    case 92: ret.push('\\\\'); break;
	    default: if (val >= 32 && val <= 126) {
		ret.push( s.charAt(i) );
	    }
		else {
		    var numStr = val.toString(16).toUpperCase();
		    while (numStr.length < 4) {
			numStr = '0' + numStr;
		    }
		    ret.push('\\u' + numStr);
		}
		break;
	    }
	}
	return ret.join('');
    };


    /*
// Strings
// For the moment, we just reuse Javascript strings.
String = String;
String.makeInstance = function(s) {
    return s.valueOf();
};
    
    
// WARNING
// WARNING: we are extending the built-in Javascript string class here!
// WARNING
String.prototype.equals = function(other, aUnionFind){
    return this == other;
};
    
var _quoteReplacingRegexp = new RegExp("[\"\\\\]", "g");
String.prototype.toWrittenString = function(cache) {
    return '"' + this.replace(_quoteReplacingRegexp,
			      function(match, submatch, index) {
				  return "\\" + match;
			      }) + '"';
};

String.prototype.toDisplayedString = function(cache) {
    return this;
};
*/


    //////////////////////////////////////////////////////////////////////








    //////////////////////////////////////////////////////////////////////
    // Hashtables
    var EqHashTable = function(inputHash) {
        this.hash = makeLowLevelEqHash();
        this.mutable = true;

    };
    EqHashTable = EqHashTable;

    EqHashTable.prototype.toWrittenString = function(cache) {
        var keys = this.hash.keys();
        var ret = [];
        for (var i = 0; i < keys.length; i++) {
	    var keyStr = toWrittenString(keys[i], cache);
	    var valStr = toWrittenString(this.hash.get(keys[i]), cache);
	    ret.push('(' + keyStr + ' . ' + valStr + ')');
        }
        return ('#hasheq(' + ret.join(' ') + ')');
    };

    EqHashTable.prototype.toDisplayedString = function(cache) {
        var keys = this.hash.keys();
        var ret = [];
        for (var i = 0; i < keys.length; i++) {
	    var keyStr = toDisplayedString(keys[i], cache);
	    var valStr = toDisplayedString(this.hash.get(keys[i]), cache);
	    ret.push('(' + keyStr + ' . ' + valStr + ')');
        }
        return ('#hasheq(' + ret.join(' ') + ')');
    };

    EqHashTable.prototype.equals = function(other, aUnionFind) {
        if ( !(other instanceof EqHashTable) ) {
	    return false; 
        }

        if (this.hash.keys().length != other.hash.keys().length) { 
	    return false;
        }

        var keys = this.hash.keys();
        for (var i = 0; i < keys.length; i++){
	    if ( !(other.hash.containsKey(keys[i]) &&
	           equals(this.hash.get(keys[i]),
		           other.hash.get(keys[i]),
		           aUnionFind)) ) {
		return false;
	    }
        }
        return true;
    };



    var EqualHashTable = function(inputHash) {
	this.hash = new _Hashtable(function(x) {
	    return toWrittenString(x); 
	},
		                   function(x, y) {
			               return equals(x, y, new plt.baselib.UnionFind()); 
		                   });
	this.mutable = true;
    };

    EqualHashTable = EqualHashTable;

    EqualHashTable.prototype.toWrittenString = function(cache) {
        var keys = this.hash.keys();
        var ret = [];
        for (var i = 0; i < keys.length; i++) {
	    var keyStr = toWrittenString(keys[i], cache);
	    var valStr = toWrittenString(this.hash.get(keys[i]), cache);
	    ret.push('(' + keyStr + ' . ' + valStr + ')');
        }
        return ('#hash(' + ret.join(' ') + ')');
    };
    EqualHashTable.prototype.toDisplayedString = function(cache) {
        var keys = this.hash.keys();
        var ret = [];
        for (var i = 0; i < keys.length; i++) {
	    var keyStr = toDisplayedString(keys[i], cache);
	    var valStr = toDisplayedString(this.hash.get(keys[i]), cache);
	    ret.push('(' + keyStr + ' . ' + valStr + ')');
        }
        return ('#hash(' + ret.join(' ') + ')');
    };

    EqualHashTable.prototype.equals = function(other, aUnionFind) {
        if ( !(other instanceof EqualHashTable) ) {
	    return false; 
        }

        if (this.hash.keys().length != other.hash.keys().length) { 
	    return false;
        }

        var keys = this.hash.keys();
        for (var i = 0; i < keys.length; i++){
	    if (! (other.hash.containsKey(keys[i]) &&
	           equals(this.hash.get(keys[i]),
		           other.hash.get(keys[i]),
		           aUnionFind))) {
	        return false;
	    }
        }
        return true;
    };


    //////////////////////////////////////////////////////////////////////

//     var JsValue = function(name, val) {
// 	this.name = name;
// 	this.val = val;
//     };

//     JsValue.prototype.toString = function() {
// 	return '#<js-value:' + typeof(this.val) + ':' + this.name + '>';
//     };

//     JsValue.prototype.toDomNode = function(cache) {
// 	return toDomNode(this.val, cache);
//     };

//     JsValue.prototype.equals = function(other, aUnionFind) {
// 	return (this.val === other.val);
//     };

//     // unbox: jsvalue -> any
//     // Unwraps the value out of the JsValue box.
//     JsValue.prototype.unbox = function()  {
//         return this.val;
//     };



//     var WrappedSchemeValue = function(val) {
// 	this.val = val;
//     };

//     WrappedSchemeValue.prototype.toString = function() { return toString(this.val); };
//     WrappedSchemeValue.prototype.toWrittenString = function(cache) { return toWrittenString(this.val, cache); };
//     WrappedSchemeValue.prototype.toDisplayedString = function(cache) { return toDisplayedString(this.val, cache); };


//     // unbox: jsvalue -> any
//     // Unwraps the value out of the WrappedSchemeValue box.
//     WrappedSchemeValue.prototype.unbox = function() {
//         return this.val;
//     };


    //////////////////////////////////////////////////////////////////////

//     var WorldConfig = function(startup, shutdown, startupArgs) {
// 	this.startup = startup;
// 	this.shutdown = shutdown;
//         this.startupArgs = startupArgs;
//     };

//     WorldConfig.prototype.toString = function() {
// 	return '#<world-config>';
//     };

//     WorldConfig.prototype.equals = function(other, aUnionFind) {
// 	return ( equals(this.startup, other.startup, aUnionFind) &&
// 		 equals(this.shutdown, other.shutdown, aUnionFind) &&
// 		 equals(this.shutdownArg, other.shutdownArg, aUnionFind) &&
// 		 equals(this.restartArg, other.restartArg, aUnionFind) );
//     };


//     var Effect = plt.baselib.structs.makeStructureType('effect', false, 0, 0, false, false);
//     Effect.type.prototype.invokeEffect = function() {
// 	helpers.raise(types.incompleteExn(
// 	    types.exnFail,
// 	    'effect type created without using make-effect-type',
// 	    []));
//     };


//     var makeEffectType = function(name, superType, initFieldCnt, impl, guard) {
// 	if ( !superType ) {
// 	    superType = Effect;
// 	}
	
// 	var newType = plt.baselib.structs.makeStructureType(name, superType, initFieldCnt, 0, false, guard);
// 	var lastFieldIndex = newType.firstField + newType.numberOfFields;

// 	newType.type.prototype.invokeEffect = function(aBigBang, k) {
// 	    var schemeChangeWorld = new PrimProc('update-world', 1, false, false,
// 			                         function(worldUpdater) {
// 				                     //helpers.check(worldUpdater, helpers.procArityContains(1),
// 					             //              'update-world', 'procedure (arity 1)', 1);
				                     
// 				                     return new INTERNAL_PAUSE(
// 					                 function(caller, onSuccess, onFail) {
// 						             aBigBang.changeWorld(function(w, k2) {
// 								 caller(worldUpdater,
// 									[w], k2,
// 									function(e) { throw e; },
// 									'change-world (effect)');
// 							     },
// 								                  function() { onSuccess(VOID_VALUE, 'restarting (change-world (effect))'); });
// 					                 });
// 			                         });

// 	    var args = this._fields.slice(0, lastFieldIndex);
// 	    args.unshift(schemeChangeWorld);
// 	    return aBigBang.caller(impl, args, k, function(e) { throw e; }, 'invoking effect ' + name);
// 	}

// 	return newType;
//     };


//     var RenderEffect = plt.baselib.structs.makeStructureType('render-effect', false, 0, 0, false, false);
//     RenderEffect.type.prototype.callImplementation = function(caller, k) {
// 	helpers.raise(types.incompleteExn(
// 	    types.exnFail,
// 	    'render effect created without using make-render-effect-type',
// 	    []));
//     };

//     var makeRenderEffectType = function(name, superType, initFieldCnt, impl, guard) {
// 	if ( !superType ) {
// 	    superType = RenderEffect;
// 	}
	
// 	var newType = plt.baselib.structs.makeStructureType(name, superType, initFieldCnt, 0, false, guard);
// 	var lastFieldIndex = newType.firstField + newType.numberOfFields;

// 	newType.type.prototype.callImplementation = function(caller, k) {
// 	    var args = this._fields.slice(0, lastFieldIndex);
// 	    caller(impl, args, k);
// 	}

// 	return newType;
//     };

    //////////////////////////////////////////////////////////////////////









    //////////////////////////////////////////////////////////////////////





    var isNumber = jsnums.isSchemeNumber;

    var isReal = jsnums.isReal;
    var isRational = jsnums.isRational;
    var isComplex = isNumber;
    var isInteger = jsnums.isInteger;

    var isNatural = function(x) {
        return (jsnums.isExact(x) && isInteger(x) 
	        && jsnums.greaterThanOrEqual(x, 0));
    };
    var isNonNegativeReal = function(x) {
	return isReal(x) && jsnums.greaterThanOrEqual(x, 0);
    };






    var isString = function(s) {
	return (typeof s === 'string' || s instanceof Str);
    }


    // equals: X Y -> boolean
    // Returns true if the objects are equivalent; otherwise, returns false.
    var equals = function(x, y, aUnionFind) {
        if (x === y) { return true; }

        if (isNumber(x) && isNumber(y)) {
	    return jsnums.eqv(x, y);
        }

        if (isString(x) && isString(y)) {
	    return x.toString() === y.toString();
        }

        if (x == undefined || x == null) {
	    return (y == undefined || y == null);
        }

        if ( typeof(x) == 'object' &&
	     typeof(y) == 'object' &&
	     x.equals &&
	     y.equals) {

	    if (typeof (aUnionFind) === 'undefined') {
	        aUnionFind = new plt.baselib.UnionFind();
	    }

	    if (aUnionFind.find(x) === aUnionFind.find(y)) {
	        return true;
	    }
	    else {
	        aUnionFind.merge(x, y); 
	        return x.equals(y, aUnionFind);
	    }
        }
        return false;
    };





    // liftToplevelToFunctionValue: primitive-function string fixnum scheme-value -> scheme-value
    // Lifts a primitive toplevel or module-bound value to a scheme value.
    var liftToplevelToFunctionValue = function(primitiveF,
				               name,
				               minArity, 
				               procedureArityDescription) {
        if (! primitiveF._mobyLiftedFunction) {
	    var lifted = function(args) {
	        return primitiveF.apply(null, args.slice(0, minArity).concat([args.slice(minArity)]));
	    };
	    lifted.equals = function(other, cache) { 
	        return this === other; 
	    }
	    lifted.toWrittenString = function(cache) { 
	        return "#<procedure:" + name + ">";
	    };
	    lifted.toDisplayedString = lifted.toWrittenString;
	    lifted.procedureArity = procedureArityDescription;
	    primitiveF._mobyLiftedFunction = lifted;
	    
        } 
        return primitiveF._mobyLiftedFunction;
    };



    //////////////////////////////////////////////////////////////////////
    var ThreadCell = function(v, isPreserved) {
        this.v = v;
        this.isPreserved = isPreserved || false;
    };



    //////////////////////////////////////////////////////////////////////




    var UndefinedValue = function() {
    };
    UndefinedValue.prototype.toString = function() {
        return "#<undefined>";
    };
    var UNDEFINED_VALUE = new UndefinedValue();

    var VoidValue = function() {};
    VoidValue.prototype.toString = function() {
	return "#<void>";
    };

    var VOID_VALUE = new VoidValue();


    var EofValue = function() {};
    EofValue.prototype.toString = function() {
	return "#<eof>";
    }

    var EOF_VALUE = new EofValue();









    //////////////////////////////////////////////////////////////////////

    // Continuation Marks

    var ContMarkRecordControl = function(dict) {
        this.dict = dict || makeLowLevelEqHash();
    };

    ContMarkRecordControl.prototype.invoke = function(state) {
        // No-op: the record will simply pop off the control stack.
    };

    ContMarkRecordControl.prototype.update = function(key, val) {
        var newDict = makeLowLevelEqHash();
        // FIXME: what's the javascript idiom for hash key copy?
        // Maybe we should use a rbtree instead?
        var oldKeys = this.dict.keys();
        for (var i = 0; i < oldKeys.length; i++) {
	    newDict.put( oldKeys[i], this.dict.get(oldKeys[i]) );
        }
        newDict.put(key, val);
        return new ContMarkRecordControl(newDict);
    };



    var ContinuationMarkSet = function(dict) {
        this.dict = dict;
    }

    ContinuationMarkSet.prototype.toDomNode = function(cache) {
        var dom = document.createElement("span");
        dom.appendChild(document.createTextNode('#<continuation-mark-set>'));
        return dom;
    };

    ContinuationMarkSet.prototype.toWrittenString = function(cache) {
        return '#<continuation-mark-set>';
    };

    ContinuationMarkSet.prototype.toDisplayedString = function(cache) {
        return '#<continuation-mark-set>';
    };

    ContinuationMarkSet.prototype.ref = function(key) {
        if ( this.dict.containsKey(key) ) {
	    return this.dict.get(key);
        }
        return [];
    };


    //////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////

//     var makeOptionPrimitive = function(name,
// 				       numArgs,
// 				       defaultVals,
// 				       usesState,
// 				       bodyF) {
//         var makeNthPrimitive = function(n) {
// 	    return new PrimProc(name,
// 			        numArgs + n,
// 			        false,
// 			        usesState,
// 			        function() {
// 				    var expectedNumArgs = numArgs + n + (usesState ? 1 : 0);
// 				    assert.equal(arguments.length,
// 					         expectedNumArgs);
// 				    var args = [arguments];
// 				    for (var i = 0; i < arguments.length; i++) {
// 				        args.push(arguments[i]);
// 				    }
// 				    var startDefaults = i - numArgs - (usesState ? 1 : 0);
// 				    return bodyF.apply(
// 				        bodyF,
// 				        args.concat(defaultVals.slice(startDefaults)));
// 			        });
//         };
	
//         var cases = [];
//         for (var i = 0; i <= defaultVals.length; i++) {
// 	    cases.push(makeNthPrimitive(i));
//         }
//         return new CasePrimitive(name, cases);
//     };












    //////////////////////////////////////////////////////////////////////


    // INTERNAL_CALL
    // used for interaction between the Primitives and the interpreter (callPrimitiveProcedure).
    // Don't confuse this with CallControl.
    var INTERNAL_CALL = function(operator, operands, k) {
        this.operator = operator;
        this.operands = operands;
        this.k = k;
    };

    // INTERNAL_PAUSE
    // used for interaction between the Primitive functions and the
    // interpreter.
    // Halts the interpreter, but passing onPause the functions necessary
    // to restart computation.
    var INTERNAL_PAUSE = function(onPause) {
        this.onPause = onPause;
    };



    //////////////////////////////////////////////////////////////////////


//     // ContinuationPromptTag: symbol | false -> ContinuationPromptTag
//     var ContinuationPromptTag = function(sym) {
//         this.sym = sym;
//     };

//     var defaultContinuationPromptTag = new ContinuationPromptTag();

//     var defaultContinuationPromptTagHandler = new PrimProc(
//         'default-continuation-prompt-tag-handler',
//         1,
//         false, 
//         true,
//         function(aState, thunk) {
// 	    aState.pushControl(
// 	        new control.ApplicationControl(
// 		    new control.ConstantControl(thunk), 
// 		    []));
//         });


    //////////////////////////////////////////////////////////////////////





    var makeList = function() {
        var result = Empty.EMPTY;
        for(var i = arguments.length-1; i >= 0; i--) {
	    result = Cons.makeInstance(arguments[i], result);
        }
        return result;
    };


    var makeVector = function() {
        return Vector.makeInstance(arguments.length, arguments);
    };


    var makeVectorImmutable = function() {
        var v = Vector.makeInstance(arguments.length, arguments);
        v.mutable = false;
        return v;
    };


    var makeString = function(s) {
	if (s instanceof Str) {
	    return s;
	}
	else if (s instanceof Array) {
            //		for (var i = 0; i < s.length; i++) {
            //			if ( typeof s[i] !== 'string' || s[i].length != 1 ) {
            //				return undefined;
            //			}
            //		}
	    return Str.makeInstance(s);
	}
	else if (typeof s === 'string') {
	    return Str.fromString(s);
	}
	else {
	    throw types.internalError('makeString expects and array of 1-character strings or a string;' +
				      ' given ' + s.toString(),
				      false);
	}
    };


    var makeHashEq = function(lst) {
	var newHash = new EqHashTable();
	while ( !isEmpty(lst) ) {
	    newHash.hash.put(lst.first.first, lst.first.rest);
	    lst = lst.rest;
	}
	return newHash;
    };


    var makeHashEqual = function(lst) {
	var newHash = new EqualHashTable();
	while ( !isEmpty(lst) ) {
	    newHash.hash.put(lst.first.first, lst.first.rest);
	    lst = lst.rest;
	}
	return newHash;
    };


    var Color = plt.baselib.structs.makeStructureType('color', false, 3, 0, false, false);
    var ArityAtLeast = plt.baselib.structs.makeStructureType(
        'arity-at-least', false, 1, 0, false,
	function(args, name, k) {
// 	    helpers.check(args[0],
//                           function(x) {
//                               return ( jsnums.isExact(x) &&
// 				       jsnums.isInteger(x) &&
// 				       jsnums.greaterThanOrEqual(x, 0) ); },
// 			  name, 
//                           'exact non-negative integer', 1);
	    return k(args);
	});
 



    //////////////////////////////////////////////////////////////////////



    var readerGraph = function(x, objectHash, n) {
        if (typeof(x) === 'object' && objectHash.containsKey(x)) {
	    return objectHash.get(x);
        }

        if (types.isPair(x)) {
	    var consPair = types.cons(x.first, x.rest);
	    objectHash.put(x, consPair);
	    consPair.f = readerGraph(x.first, objectHash, n+1);
	    consPair.r = readerGraph(x.rest, objectHash, n+1);
	    return consPair;
        }

        if (types.isVector(x)) {
	    var len = x.length();
	    var aVector = types.vector(len, x.elts);
	    objectHash.put(x, aVector);	
	    for (var i = 0; i < len; i++) {
	        aVector.elts[i] = readerGraph(aVector.elts[i], objectHash, n+1);
	    }
	    return aVector;
        }

        if (types.isBox(x)) {
	    var aBox = types.box(x.ref());
	    objectHash.put(x, aBox);
	    aBox.val = readerGraph(x.ref(), objectHash, n+1);
	    return aBox;
        }

        if (types.isHash(x)) {
	    throw new Error("make-reader-graph of hash not implemented yet");
        }

        if (types.isStruct(x)) {
	    var aStruct = helpers.clone(x);
	    objectHash.put(x, aStruct);
	    for(var i = 0 ;i < x._fields.length; i++) {
	        x._fields[i] = readerGraph(x._fields[i], objectHash, n+1);
	    }
	    return aStruct;
        }

        if (types.isPlaceholder(x)) {
	    return readerGraph(x.ref(), objectHash, n+1);
        }

        return x;
    };





    //////////////////////////////////////////////////////////////////////






    types.exceptionHandlerKey = new Symbol("exnh");

    types.symbol = Symbol.makeInstance;
    types.rational = jsnums.makeRational;
    types.floatpoint = jsnums.makeFloat;
    types.complex = jsnums.makeComplex;
    types.bignum = jsnums.makeBignum;
    types.list = makeList;
    types.vector = makeVector;
    types.vectorImmutable = makeVectorImmutable;
    types.regexp = function(p) { return new RegularExpression(p) ; }
    types.byteRegexp = function(p) { return new ByteRegularExpression(p) ; }
    types.character = Char.makeInstance;
    types['string'] = makeString;
    types.box = function(x) { return new Box(x, true); };
    types.placeholder = function(x) { return new Placeholder(x); };
    types.boxImmutable = function(x) { return new Box(x, false); };
    types.path = function(x) { return new Path(x); };
    types.bytes = function(x, mutable) { return new Bytes(x, mutable); };
    types.bytesImmutable = function(x) { return new Bytes(x, false); };
    types.keyword = function(k) { return new Keyword(k); };
    types.pair = function(x, y) { return Cons.makeInstance(x, y); };
    types.hash = makeHashEqual;
    types.hashEq = makeHashEq;
    types.jsValue = function(name, val) { return new JsValue(name, val); };
    types.wrappedSchemeValue = function(val) { return new WrappedSchemeValue(val); };


    types.color = Color.constructor;
    types.colorRed = function(x) { return Color.accessor(x, 0); };
    types.colorGreen = function(x) { return Color.accessor(x, 1); };
    types.colorBlue = function(x) { return Color.accessor(x, 2); };

    types.arityAtLeast = ArityAtLeast.constructor;
    types.arityAtLeastValue = function(arity) { return ArityAtLeast.accessor(arity, 0); };


    types.FALSE = false;
    types.TRUE = true;
    types.EMPTY = Empty.EMPTY;

    types.equals = equals;
    types.isNumber = isNumber;

    types.isReal = jsnums.isReal;
    types.isRational = jsnums.isRational;
    types.isComplex = isNumber;
    types.isInteger = jsnums.isInteger;
    types.isNatural = isNatural;
    types.isNonNegativeReal = isNonNegativeReal;


    types.isSymbol = function(x) { return x instanceof Symbol; };
    types.isChar = function(x) { return x instanceof Char; };
    types.isString = isString;
    types.isPair = function(x) { return x instanceof Cons; };
    types.isList = isList;
    types.isEmpty = function(x) { return x === Empty.EMPTY; };
    types.isVector = function(x) { return x instanceof Vector; };
    types.isBox = function(x) { return x instanceof Box; };
    types.isPlaceholder = function(x) { return x instanceof Placeholder; };
    types.isHash = function(x) { return (x instanceof EqHashTable ||
				         x instanceof EqualHashTable); };
    types.isByteString = function(x) { return x instanceof Bytes; };
    types.isStruct = function(x) { return x instanceof Struct; };
    types.isArityAtLeast = ArityAtLeast.predicate;
    types.isColor = Color.predicate;

//     types.isFunction = function(x) {
// 	return (x instanceof PrimProc);
//     };


    types.isJsValue = function(x) { return x instanceof JsValue; };
    types.isWrappedSchemeValue = function(x) { return x instanceof WrappedSchemeValue; };

    types.cons = Cons.makeInstance;

    types.UNDEFINED = UNDEFINED_VALUE;
    types.VOID = VOID_VALUE;
    types.EOF = EOF_VALUE;

//     types.ContinuationPromptTag = ContinuationPromptTag;
//     types.defaultContinuationPromptTag = defaultContinuationPromptTag;
//     types.defaultContinuationPromptTagHandler = defaultContinuationPromptTagHandler;
//     types.makeOptionPrimitive = makeOptionPrimitive;

    types.internalCall = function(op, args, k) { return new INTERNAL_CALL(op, args, k); };
    types.isInternalCall = function(x) { return (x instanceof INTERNAL_CALL); };
    types.internalPause = function(onPause) { return new INTERNAL_PAUSE(onPause) };
    types.isInternalPause = function(x) { return (x instanceof INTERNAL_PAUSE); };

    types.contMarkRecordControl = function(dict) { return new ContMarkRecordControl(dict); };
    types.isContMarkRecordControl = function(x) { return x instanceof ContMarkRecordControl; };
    types.continuationMarkSet = function(dict) { return new ContinuationMarkSet(dict); };
    types.isContinuationMarkSet = function(x) { return x instanceof ContinuationMarkSet; };
//     types.isContinuationPromptTag = function(x) { return x instanceof ContinuationPromptTag; };


    types.Box = Box;
    types.Placeholder = Placeholder;
    types.ThreadCell = ThreadCell;


    types.isStructType = function(x) { return x instanceof plt.baselib.structs.StructType; };

//     types.StructProc = StructProc;
//     types.StructConstructorProc = StructConstructorProc;
//     types.StructPredicateProc = StructPredicateProc;
//     types.StructAccessorProc = StructAccessorProc;
//     types.StructMutatorProc = StructMutatorProc;




    types.makeLowLevelEqHash = makeLowLevelEqHash;



    ///////////////////////////////////////
    // World-specific exports

//     // big bang info to be passed into a make-world-config startup argument
//     var BigBangInfo = plt.baselib.structs.makeStructureType('bb-info', false, 2, 0, false,
// 			                function(args, name, k) {
// 				            //helpers.check(args[0], helpers.procArityContains(1), name, 'procedure (arity 1)', 1);
// 				            //helpers.check(args[1], types.isJsValue, name, 'js-object', 2);
// 				            return k(args);
// 			                });
//     types.BigBangInfo = BigBangInfo;
//     types.makeBigBangInfo = BigBangInfo.constructor;
//     types.isBigBangInfo = BigBangInfo.predicate;
//     types.bbInfoChangeWorld = function(info) { return BigBangInfo.accessor(info, 0); };
//     types.bbInfoToplevelNode = function(info) { return BigBangInfo.accessor(info, 1); };



    // World config information for user-defined configurations
//     types.worldConfig = function(startup, shutdown, pause, restart) { return new WorldConfig(startup, shutdown, pause, restart); };
//     types.isWorldConfig = function(x) { return x instanceof WorldConfig; };


    // exporting information to create effect types
//     types.makeEffectType = makeEffectType;
//     types.isEffectType = function(x) {
// 	return ((x instanceof plt.baselib.structs.StructType)&& x.type.prototype.invokeEffect) ? true : false;
//     };

//     types.isEffect = Effect.predicate;


    // exporting functions to create render effect types
//     types.makeRenderEffectType = makeRenderEffectType;
//     types.isRenderEffectType = function(x) {
// 	return (x instanceof plt.baselib.structs.StructType && x.type.prototype.callImplementation) ? true : false;
//     };

//     types.isRenderEffect = RenderEffect.predicate;



    types.readerGraph = readerGraph;


    scope.link.announceReady('types');
})(this['plt']);

