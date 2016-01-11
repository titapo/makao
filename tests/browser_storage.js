var factory = new EntityFactory();
factory.setType("node", Node);
factory.setType("leaf", Leaf);


var suite = new TestSuite("browser storage");
suite.add(new TestCase("browser storage", function(test)
            {
                var node = new Node("root");
                var endNode = new Node("something");
                node.add(new Node("user"));
                node.getChild("user").add(endNode);

                var storage = new BrowserStorage("targette", factory);
                storage.storeNode(node);
                //  TODO
                //test.assertEquals(storage.loadNode(), node);
            }));

suite.run([]);

