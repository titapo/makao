// application

var g_logger = new Logger("makao", "info");
var g_context;
var g_rootNode;
var g_actionList;
var g_baseArea;
var g_handler;

// TODO rename to Controller as soon as possible
function GenerateTree()
{
    var root = new Node("root");
    {
        var constNode = new Node("makao");
        {
            var info = new Node("info");
            info.add(new Leaf("program", "makao"));
            info.add(new Leaf("version", "v0.0"));
            info.add(new Leaf("author", "titapo"));
            constNode.add(info);
        }
        root.add(constNode);
    }
    root.add(new Leaf("README", "- todo -"))
    root.add(new Leaf("TODO", "- todo -"))

    return root;
}

function CreateActionList()
{
    var actions = new ActionList();

    actions.set("go-to-child", function(node)
    {
        return ["go-to-child"]
    });

    actions.set("node-actions", function(node)
    {
    });
    actions.set("node-action-creation", function(node)
    {
        return g_context.entityFactory.listTypenames();
    });

    actions.set("storage-actions", function(node)
    {
        let storageService = g_context.model.getService("storage");

        if (!storageService.hasStorage())
            g_logger.debug("No storage configured");
            return "";

        let storage = storageService.getActiveStorage();
        var menu = new Menu("Storage | " + storageService.activeId, default_menu);
        menu.add(Tag('p', "Type: " + storage.type,  {'class':'static'}));
        menu.add(Tag('p', "Path: " + storage.path.display(),  {'class':'static'}));

        menu.add(ActionButton("load", new Action(new Callback(g_handler, g_handler.load), "load").display()));
        menu.add(ActionButton("store", new Action(new Callback(g_handler, g_handler.store), "store").display()));
        menu.add(ActionButton("clear", new Action(new Callback(g_handler, g_handler.clear), "clear").display()));
        menu.add(ActionButton("change storage", new Action(new Callback(g_handler, g_handler.changeStorage), "change-storage").display()));

        return menu.display();
    });

    actions.set("child-modify", function(child)
    {
        return ["update",
            "remove",
            "move-up",
            "move-down"];
        ;
    });
    actions.set("child-view", function(child)
    {
        return ["create-view"];
        ;
    });

    return actions;
}

function getDefaultConfig()
{
    return {
        "logLevel":"info",
        "style":"style/basic.css"
    }
}
function LoadGlobalConfig(ctx, filename)
{
    var fh = new FileHandler(filename);
    fh.setCallback(function(configString)
    {
        ctx.setConfig(getDefaultConfig());
        g_logger.info("loading global config");

        try
        {
        var input = "{" + configString + "}";
        var config = JSON.parse(input);
        for (var propertyName in config)
            g_logger.debug(" config: " + propertyName + " : " + config[propertyName]);

        // TODO validating
        if (true)
        {
            ctx.overrideConfig(config);
        }
        else
        {
            g_context.feedback("could not verify global config", FeedbackLevel.Error);
        }

        Logger.setLogLevel(ctx.config["logLevel"]);
        g_context.feedback("global configuration loaded");
        g_logger.info("load stylesheet: " + ctx.config["style"]);
        g_logger.info(document.getElementsByTagName("link").item(0).setAttribute("href", ctx.config["style"]));
        }
        catch (e)
        {
            if (e instanceof SyntaxError)
            {
                g_context.feedback("Error during config loading: " + e.message);
            }
        }
        
    });
    fh.read();
}

function InitView(message, level)
{
    g_context.view.init(g_baseArea, g_actionList);
    var feedbackArea = g_context.view.createSubArea("general-feedback");
    feedbackArea.id = "g_feedback";
    feedbackArea.className = "feedback-container";
    g_context.setFeedback(function(message, level)
            {
                var messageNode = document.createElement("div");
                var cls = "";
                switch (level)
                {
                    case FeedbackLevel.Normal:
                        cls = " success";
                        break;
                    case FeedbackLevel.Warning:
                        cls = " warning";
                        break;
                    case FeedbackLevel.Error:
                        cls = " error";
                        break;
                }
                messageNode.className = "msg" + cls;
                messageNode.innerHTML = message;
                feedbackArea.appendChild(messageNode);
                setTimeout(function () {
                    feedbackArea.removeChild(messageNode)
                }, 5000);
            });
}

function Init()
{
    g_logger.info("Init");
    // tree generation
    g_rootNode = GenerateTree();

    g_context = new Context(g_rootNode);
    g_baseArea = document.getElementById("base-area"); // base area
    g_actionList = CreateActionList(); // actions for tree handling/display
    InitView();

    g_handler = new StorageOperationHandler(g_context);

    g_context.entityFactory.setType("leaf", Leaf);
    g_context.entityFactory.setType("node", Node);
    g_context.entityFactory.setType("text-leaf", TextLeaf);
    g_context.entityFactory.setType("link-leaf", LinkLeaf);
    /*
    g_context.entityFactory.setType("boolean-leaf", BooleanLeaf);
    g_context.entityFactory.setType("enum-leaf", EnumLeaf);
    */

    LoadGlobalConfig(g_context, "file:global/global.conf");
}

function DisplayActualNode()
{
    if (typeof g_baseArea === 'undefined')
        throw "Entity is uninitialized";

    g_context.view.display();
}
