/**
*/

// TODO it should be derived from view base class
class View extends Observer
{
    constructor(name, model, path)
    {
        super(name, model); // Observer
        this.logger = new Logger(name);
        this.tree = model.getService("tree");
        this.path = path;
        this.baseArea = null;
        this.area = null;
        this.actionList = null;
        this.subViews = [];
        this.controller = new SimpleController(this.name + "-ctrl", this.model, this);
    }

    init(p_area/*layer?*/, p_actionList)
    {
        this.baseArea = p_area;
        var domNode = document.createElement("div");
        domNode.className = "default-area";
        this.baseArea.appendChild(domNode);
        this.area = domNode;
        this.actionList = p_actionList;
        this.logger.info("View initialized.");
    }

    /// @will-be deprecated. Use createSubView() instead.
    createSubArea(identifier)
    {
        var domNode = document.createElement("div");
        domNode.className = "sub-area";
        this.baseArea.appendChild(domNode);
        return domNode;
    }

    createSubView(identifier, path)
    {
        var view = new View(identifier, this.model, path);
        var area = this.createSubArea("TODO-no-effect");
        view.init(area, this.actionList/*TODO may be different*/);
        this.subViews.push(view);
        this.display();
    }

    update()
    {
        this.display();
    }

    /**
     * This method should be extracted
     */
    remap(input)
    {
        var map = {
            "go-to-child": "go",
            "move-up": "^",
            "move-down": "v",
        };

        if (map[input] !== undefined)
            return map[input];

        return input;
    }

    display()
    {
        if (this.area === null || this.actionList === null)
        {
            this.logger.error("View has not been initialized!");
            throw "View has not been initialized!";
        }
        this.logger.info("display()");
        var node = this.getCurrentNode()
            var result = node.display(this.actionList);
        var o = '';
        //{
        var out = '';
        out += this.path.display();
        if (result.topactions !== undefined)
        {
            out += Tag("div",
                    this._displayActionGroup(result.topactions[0]), // TODO more if exists
                    {"class":"base"});
        }
        out += Tag("h3", result.name, {"class":"title"});
        out += Tag("p", "(type:" + result.type + ")");
        for (var actionGroup of result.actions)
        {
            if (actionGroup == "node-action-creation") // it is very ugly
            {
                var creationMenu = new Menu("Create ...", default_menu);
                for (var action of this.actionList.list[actionGroup]())
                {
                    creationMenu.add(
                            ActionButton(
                                this.remap(action),
                                this.controller.getAction(actionGroup).display(action)));
                }
                out += creationMenu.display();
            }
            else
            {
                out += this.actionList.list[actionGroup]()
            }
        }

        // TODO clean it up
        var content = '';
        for (let child of result.content)
        {
            content += this._displayChild(child);
        }

        out += Tag("div", content, {"class":"entity-content"});
        o = Tag("div", out, {"class":"entity"});
        //}

        this.area.innerHTML = o;
        this.displaySubViews()
    }

    _displayChild(child)
    {
        var action_out = '';

        for (let actionGroupName of child.actions)
        {
            action_out += this._displayActionGroup(actionGroupName, child.name);
        }

        return Tag("p", child.name + " (" + child.type + ")"
                + (child.content?": " + child.content:"")
                + action_out
                );
    }

    _displayActionGroup(groupName, childName)
    {
        var groupActions = this.actionList.list[groupName]();

        // display concrete actions in this group
        var out = "";
        for (let action of groupActions)
        {
            out += ActionButton(
                    this.remap(action),
                    this.controller.getAction(action).display(childName));
        }
        return out;
    }

    displaySubViews()
    {
        for (let subView of this.subViews)
        {
            subView.display();
        }
    }

    getPath()
    {
        return this.path;
    }

    //@deprecated
    getCurrentNode()
    {
        this.logger.info("getCurrentNode:" + this.path.display());
        var node = this.tree.getEntity(this.path);
        if (!(node instanceof Node))
        {
            this.logger.error("given parameter is not a node");
            this.x = node;
            // TODO clear path
            throw "given parameter is not a node!";
        }
        return node;
    }

    goToBase()
    {
        if (this.path.isOnTop())
        {
            this.logger.error("already on top");
            throw "already on top";
        }

        this.path.clear();
        this.display();
    }

    goUp()
    {
        if (this.path.isOnTop())
        {
            this.logger.error("already on top");
            throw "already on top";
        }
        this.path.up();
        this.display();
    }

    goToChild(childName)
    {
        this.path.to(childName);
        this.display();
    }
}
