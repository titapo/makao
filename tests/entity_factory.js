var suite = new TestSuite("entity factory");

suite.add(new TestCase("entity factory", function(test)
            {
                var factory = new EntityFactory();
                factory.setType("leaf", Leaf);
                factory.setType("node", Node);
                test.assertEquals(factory.getType("leaf"), Leaf);
                test.assertEquals(factory.getType("node"), Node);
                test.assertEquals(factory.listTypenames(), ["leaf", "node"]);
            }));

suite.add(new TestCase("entity factory create() for all supported types", function(test)
            {
                var factory = new EntityFactory();
                factory.setType("leaf", Leaf);
                factory.setType("link-leaf", LinkLeaf);
                factory.setType("enum-leaf", EnumLeaf);
                factory.setType("text-leaf", TextLeaf);
                factory.setType("boolean-leaf", BooleanLeaf);
                factory.setType("node", Node);

                var list = factory.listTypenames();
                for (var i = 0; i < list.length; ++i)
{
    var typeName = list[i];
    console.log(typeName);
    test.assertIsInstance(factory.create(typeName), factory.getType(typeName));
}
}));

suite.run();
