// base class for leaves and nodes
class Entity
{
    constructor(name, type, base)
    {
        // FIXME(titapo): logger identifier stores only create-time info
        this.logger = new Logger("[" + name + "|" + type +"]");
        this.name = name;
        this.type = type;
        this.base = base;
        this.logger.debug("create(" + name + ", " + type + ")");
    }

    display()
    {
        throw "Entity.display() is not callable!";
    }

    displayBrief()
    {
        throw "Entity.displayBrief() is not callable!";
    }

    generateOutput()
    {
        throw "Entity.generateOutput() is not callable!";
    }

    createForm(title)
    {
        throw "Entity.createForm() is not callable!";
    }

    clone()
    {
        return new Entity(this.name, this.type, this.base);
    }
}

