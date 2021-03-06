var factory = new EntityFactory();
factory.setType("node", Node);
factory.setType("leaf", Leaf);

var suite = new TestSuite("entity test");
// leaf tests
suite.add(new TestCase("leaf", function(test)
            {
                var leaf = new Leaf("a", "b");
                test.assertEquals(leaf.content, "b");
            }));

suite.add(new TestCase("leaf clone", function(test)
            {
                var leaf = new Leaf("a", "b");
                var copy = leaf.clone();
                test.assertEquals(copy.name, "a");
                test.assertEquals(copy.type, "leaf");
                test.assertEquals(copy.base, 0);
                test.assertEquals(copy.content, "b");
            }));

suite.add(new TestCase("generate leaf output", function(test)
            {
                var leaf = new Leaf("myLeafName", "myLeafValue");
                var out = leaf.generateOutput();
                test.assertEquals(
                    '{"name":"myLeafName","type":"leaf","content":"myLeafValue"}', out);
            }));

suite.add(new TestCase("create leaf from json", function(test)
            {
                var input = '{"name":"myLeafName","type":"leaf","content":"myLeafValue"}';
                var leaf = createTreeFromString(input, factory);
                test.assertEquals(leaf.name, "myLeafName");
                test.assertEquals(leaf.type, "leaf");
                test.assertEquals(leaf.base, 0);
                test.assertEquals(leaf.content, "myLeafValue");
            }));

// node tests
suite.add(new TestCase("add and remove child", function(test)
            {
                var node = new Node("testNode");
                var leaf = new Leaf("a", "b");
                node.add(leaf);
                var got = node.getChild("a");
                test.assertEquals(leaf, got);
                node.remove("a");
                got = node.getChild("a");
                test.assertEquals(undefined, got);
            }));
suite.add(new TestCase("node clone", function(test)
            {
                var node = new Node("testNode");
                var leaf = new Leaf("a", "b");
                node.add(leaf);

                var copy = node.clone();
                // change leaf parameter -- copy must not change
                leaf.name = "changed";
                test.assertEquals(copy.name, "testNode");
                test.assertEquals(copy.type, "node");
                test.assertEquals(copy.base, 0);
                test.assertEquals(copy.children[0].name, "a");
            }));

suite.add(new TestCase("generate node output", function(test)
            {
                var node = new Node("myNode");
                node.add(new Leaf("leaf", "val"));
                var out = node.generateOutput();
                test.assertEquals(
                    '{"name":"myNode","type":"node","children":[{"name":"leaf","type":"leaf","content":"val"}]}', out);
            }));

suite.add(new TestCase("create empty node from json", function(test)
            {
                var input = '{"name":"myNode","type":"node","children":[]}';
                var node = createTreeFromString(input, factory);
                test.assertEquals(node.name, "myNode");
                test.assertEquals(node.type, "node");
                test.assertEquals(node.base, 0);
                test.assertEquals(node.children.length, 0);
                suite.iii = input;
                suite.fff = factory;
            }));

suite.add(new TestCase("create node from json", function(test)
            {
                var input = '{"name":"myNode","type":"node","children":[{"name":"leafName","type":"leaf","content":"val"}]}';
                var node = createTreeFromString(input, factory);
                test.assertEquals(node.name, "myNode");
                test.assertEquals(node.type, "node");
                test.assertEquals(node.base, 0);
                test.assertEquals(node.children.length, 1);
                test.assert(node.children[0] instanceof Leaf);
                test.assertEquals(node.children[0].name, "leafName");
                test.assertEquals(node.children[0].content, "val");
                test.assertEquals(node.children[0].type, "leaf");
                test.assertEquals(node.children[0].base, node);
            }));
suite.add(new TestCase("create embed node from json", function(test)
            {
                var input =
    '{"name":"myNode","type":"node","children":'
        + '['
    + '{"name":"leafName","type":"leaf","content":"val"},'
    + '{"name":"embedNode","type":"node","children":'
        + '['
    + '{"name":"leafOfEmbed","type":"leaf","content":"2"}'
    + ']'
    + '}'
    + ']'
    + '}';
var node = createTreeFromString(input, factory);
test.assertEquals(node.name, "myNode");
test.assertEquals(node.type, "node");
test.assertEquals(node.base, 0);
test.assertEquals(node.children.length, 2);

test.assertIsInstance(node.children[0], Leaf);
test.assertEquals(node.children[0].name, "leafName");
test.assertEquals(node.children[0].content, "val");
test.assertEquals(node.children[0].type, "leaf");
test.assertEquals(node.children[0].base, node);

test.assertIsInstance(node.children[1], Node);
test.assertEquals(node.children[1].name, "embedNode");
test.assertEquals(node.children[1].type, "node");
test.assertEquals(node.children[1].base, node);
test.assertEquals(node.children[1].children.length, 1);
test.assertIsInstance(node.children[1].children[0], Leaf);
test.assertEquals(node.children[1].children[0].name, "leafOfEmbed");
test.assertEquals(node.children[1].children[0].type, "leaf");
test.assertEquals(node.children[1].children[0].base, node.children[1]);
test.assertEquals(node.children[1].children[0].content, "2");
    }));

// variables test
suite.add(new TestCase("link-leaf test", function(test)
            {
                var link = new LinkLeaf("mypage", "example.com");
                /*{*/
                test.assertEquals(link.name, "mypage");
                /*}*/
                test.assertEquals(link.displayBrief(), "<a target='_blank' href='example.com'>mypage</a> ")
            }));

suite.add(new TestCase("text-leaf", function(test)
            {
                var text = new TextLeaf("mytext", "this is a long story");
                test.assertEquals(text.content, "this is a long story");
            }));

suite.add(new TestCase("enum-leaf", function(test)
            {
                var options = ["red", "green", "blue"];
                var leaf = new EnumLeaf("mycolor", options, "green");
                test.assertEquals(leaf.content, "green");
            }));

suite.add(new TestCase("enum-leaf invalid initialization", function(test)
            {
                var options = ["red", "green", "blue"];
                test.expectThrow();
                var leaf = new EnumLeaf("mycolor", options, "yellow");
            }));

suite.add(new TestCase("enum-leaf invalid options given", function(test)
            {
                test.expectThrow();
                var leaf = new EnumLeaf("mycolor", "this is invalid", "yellow");
            }));

suite.add(new TestCase("boolean leaf", function(test)
            {
                var field = new BooleanLeaf("Favourite color", true);
                // field.setValue("Red"); TODO check validation
            }));

suite.run();
