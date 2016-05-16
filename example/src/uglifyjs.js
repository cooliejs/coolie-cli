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
                console.log('---------------------');
                console.log(node.args[0]);
                console.log('---------------------');
            }
        }
    }));

    var offset = 0;
    requireNodeList.forEach(function (node) {
        var replaceValue = '【0】';
        var replacement = new U2.AST_String({
            value: '【0】'
        }).print_to_string({beautify: true});
        var arg0 = node.args[0];
        var startPos = arg0.start.pos + offset;
        var endPos = arg0.start.endpos + offset;
        var originalLength = arg0.value.length;

        code = splice_string(code, startPos, endPos, replacement);
        offset += replaceValue.length - originalLength;
    });

    return code;
}

function splice_string(str, begin, end, replacement) {
    return str.substr(0, begin) + replacement + str.substr(end);
}


// test it

function test() {
    require("abcdef");
    require("abcdef", "ddd");
    require.async("abcdef");
    require.async("abcdef", function (exports) {
        console.log(exports);
    });
}

console.log(replace_throw_string(test.toString()));