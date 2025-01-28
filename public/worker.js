// public/worker.js
addEventListener("message", (event) => {
    postMessage("Worker says: " + event.data);
  });
  