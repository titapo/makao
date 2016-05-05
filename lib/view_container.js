
/**
 * Contains views.
 */
class ViewContainer
{
    constructor(base)
    {
        this.logger = new Logger("view-container");
        this.logger.info("create view container");
        this.baseArea = base; // base html node
        this.views = [];
    }

    createView(name, model, path, actionList)
    {
        let view = new View(name, model, path);
        view.init(this.baseArea, actionList);
        this.views.push(view);
        return view;
    }
}
