var suite = new TestSuite("path");
suite.add(new TestCase("path initiated by list", function(test)
            {
                var l = ["root", "user", "something"];
                var path = new Path(l);
                test.assertEquals(path.get(), l);
            }));

suite.add(new TestCase("path is displayable, changeable, clearable", function(test)
            {
                var l = ["root", "user", "something"];
                var path = new Path(l);
                test.assertEquals(path.display(), "root / user / something");

                path.up();
                test.assertEquals(path.display(), "root / user");

                path.to("added");
                test.assertEquals(path.display(), "root / user / added");

                path.clear();
                test.assertEquals(path.display(), "");

                // up from top (= remove from empty list)
                path.up();
                test.assertEquals(path.display(), "");
            }));


suite.add(new TestCase("path can process another path ", function(test)
            {
                var other = new Path(["sub", "path"])
    var l = ["root", "user", other, "something"];
var path = new Path(l);
test.assertEquals(path.get(), ["root", "user", "sub", "path", "something"]);
            }));

suite.add(new TestCase("path can navigate", function(test)
            {
                var startNode = new Node("root");
                var endNode = new Node("something");
                startNode.add(new Node("user"));
                startNode.getChild("user").add(endNode);
                var l = ["user", "something"];
                var path = new Path(l);
                test.assertEquals(path.navigate(startNode), endNode);
            }));

suite.add(new TestCase("path can process through navigation", function(test)
            {
                var startNode = new Node("root");
                var endNode = new Node("something");
                startNode.add(new Node("user"));
                startNode.getChild("user").add(endNode);
                var l = ["user", "something"];
                var path = new Path(l);
                var output = "";
                var method = function(node)
                {
                    output += node.name + " ";
                }
                path.process(method, startNode);
                test.assertEquals(output, "user something ");
            }));

suite.run([]);
