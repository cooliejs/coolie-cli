var U2 = require("uglify-js");

function replace_throw_string(code) {
    var ast = U2.parse(code, {
        strict: true
    });
    var requireNodeList = [];

    ast.walk(new U2.TreeWalker(function (node) {
        if (node instanceof U2.AST_Node && node.start.value === 'require' && node.args) {
            if ((node.args.length === 1 || node.args.length === 2) &&
                (node.expression.property === 'async' || !node.expression.property)) {
                requireNodeList.push(node);
                // console.log('---------------------');
                // console.log(node.args[0]);
                // console.log(node.args[1]);
                // console.log('---------------------');
            }
        }
    }));

    var offset = 0;
    requireNodeList.forEach(function (node) {
        var replaceValue = '0';
        var arg0 = node.args[0];
        var arg1 = node.args[1];
        var async = node.expression.prototype === 'async' || node.expression.end.value === 'async';
        var startPos = arg0.start.pos + offset;
        var endPos = arg0.start.endpos + offset;
        var originalLength = arg0.value.length;
        var replacement = new U2.AST_String({
            value: replaceValue,
            quote: arg0.quote
        }).print_to_string({beautify: true});

        if (!async && arg1) {
            var pipeLine = arg1.value.split('|');
            originalLength = arg1.start.endpos - arg0.start.pos - 2;
            endPos = arg1.start.endpos + offset;
        }

        code = code.slice(0, startPos) + replacement + code.slice(endPos);
        offset += replaceValue.length - originalLength;
    });

    return code;
}


// test it

function test() {
    require("abcdef");
    require('abcdef', "ddd");
    require.async("abcdef");
    require.async("abcdef22222");
    require('abcdef', "A|B");
    require.async("abcdef", function (exports) {
        console.log(exports);
        require("abcdef");
        require('abcdef', "ddd");
        require.async("abcdef");
        require.async("abcdef22222");
        require('abcdef', "ddd|dfqdqw");

    });
}

console.log(test.toString());
console.log(replace_throw_string(test.toString()));