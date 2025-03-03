const http = require("http");
const fs = require("fs");
const url = require("url");

const app = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === "/" && req.method === "GET") {
        res.writeHead(200);
        res.end(JSON.stringify({ message: "Welcome to the Task manager API!" }));
    } 
    else if (parsedUrl.pathname === "/tasks" && req.method === "GET" && parsedUrl.query.id) {
        try {
            const tasks = JSON.parse(fs.readFileSync("tasks.json", "utf-8"));
            const taskId = parseInt(parsedUrl.query.id);
            const task = tasks.find(t => t.id === taskId);

            if (task) {
                res.writeHead(200);
                res.end(JSON.stringify(task));
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({ error: "Task not found" }));
            }
        } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: "Error reading tasks.json" }));
        }
    } 
    else if (parsedUrl.pathname === "/tasks" && req.method === "GET") {
        try {
            const tasks = fs.readFileSync("tasks.json", "utf-8");
            res.writeHead(200);
            res.end(tasks);
        } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: "Error reading tasks.json" }));
        }
    } 
    else if (parsedUrl.pathname === "/tasks" && req.method === "POST") {
        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {
            try {
                const newTask = JSON.parse(body);

                if (!newTask.title || !newTask.description) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "Invalid task data" }));
                }

                const tasks = JSON.parse(fs.readFileSync("tasks.json", "utf-8") || "[]");

                const lastId = tasks.length > 0 ? tasks[tasks.length - 1].id : 0;
                newTask.id = lastId + 1;

                tasks.push(newTask);
                fs.writeFileSync("tasks.json", JSON.stringify(tasks, null, 2));

                res.writeHead(201);
                res.end(JSON.stringify({ message: "Task added", task: newTask }));
            } catch (error) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: "Error adding task" }));
            }
        });
    }
    else if(parsedUrl.pathname === "/tasks" && req.method === "PUT" ) {
        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });
        req.on("end",()=>{
            try {
                const updatedTask = JSON.parse(body);
                const tasks = JSON.parse(fs.readFileSync("tasks.json", "utf-8") || "[]");
                const index = tasks.findIndex(t => t.id === updatedTask.id);
                if (index !== -1) {
                    tasks[index] = updatedTask;
                    fs.writeFileSync("tasks.json", JSON.stringify(tasks, null, 2));
                    res.end(JSON.stringify({ message: "Task updated", task: updatedTask }));
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: "Task not found" }));
                }

            } catch (error) {
                res.writeHead(500);
                console.log(error);
                res.end(JSON.stringify({ error: "Error updating task" }));
            }
        })
    }
    else if(parsedUrl.pathname === "/tasks" && req.method === "DELETE"&&parsedUrl.query.id)  {

            try {
                const tasks = JSON.parse(fs.readFileSync("tasks.json", "utf-8") || "[]");
                const taskId = parseInt(parsedUrl.query.id);
                const index = tasks.findIndex(t => t.id === taskId);
                if (index !== -1) {
                    const Dtask=tasks.splice(index,1);
                    fs.writeFileSync("tasks.json", JSON.stringify(tasks, null, 2));
                    res.end(JSON.stringify({ message: "Task Deleted", task: Dtask }));
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: "Task not found" }));
                }

            } catch (error) {
                res.writeHead(500);
                console.log(error);
                res.end(JSON.stringify({ error: "Error deleting task" }));
            }
        }
    
    else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Route not found" }));
    }
});

app.listen(3000, () => {
    console.log("Listening to requests on http://localhost:3000");
});
