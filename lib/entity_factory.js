
function EntityFactory()
{
    var entityMap = {};

    this.setType = function(identifier, type)
    {
        console.log("EntityFactory.setType(" + identifier + ")");
        entityMap[identifier] = type;
    }

    this.getType = function(identifier)
    {
        return entityMap[identifier];
    }

    this.create = function(identifier /*, params?*/)
    {
        console.log("EntityFactory.create(" + identifier + ")");
        if (entityMap[identifier] === undefined)
            throw "There is not '" + identifier + "' in entityMap";

        let obj = entityMap[identifier].create("");
        obj.type = identifier;
        console.log("base:" + obj.base);
        return obj;
    }

    this.listTypenames = function()
    {
        return Object.keys(entityMap);
    }

}

function createTreeFromString(jsonString, factory)
{
    var json = JSON.parse(jsonString);
    return createFromJson(json, factory);
}

function createFromJson(json, factory)
{
    console.log(" process: " + JSON.stringify(json));
    if (json === null)
    {
        console.log("input json is null");
        return false;
    }
    if (factory.getType(json.type) === undefined)
        throw "createFromJson() invalid type: '" + json.type + "'";

    console.log("  type:" + json.type);

    var entity = factory.create(json.type);
    if (entity instanceof Leaf)
    {
        entity.name = json.name;
        entity.content = json.content;
        entity.type = json.type;
    }
    else if (entity instanceof Node)
    {
        entity.name = json.name;
        entity.type = json.type;
        for (var i = 0; i < json.children.length; ++i)
        {
            var child = json.children[i];
            entity.add(createFromJson(child, factory));
        }
    }
    else
        throw "createFromJson() " + json.name + " has invalid type: '" + json.type + "'";

    return entity;
}
