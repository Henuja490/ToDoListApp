const express = require('express');
const app = express();
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-service-account.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();


app.use(express.json());


app.get("/users", async (req, res) => {
  try {
    const usersRef = db.collection("Users");
    const snapshot = await usersRef.get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
});

app.get("/users/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
      const usersRef = db.collection("Users").doc(userId);
      const snapshot = await usersRef.get();
      const users = snapshot.data();
      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
  });

  app.put("/users/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
      const usersRef = db.collection("Users").doc(userId);
      await usersRef.update(req.body);
      
      res.status(200).json("users updated successfully");
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
  });

  app.delete("/users/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
      const usersRef = db.collection("Users").doc(userId);
      await usersRef.delete();
      
      res.status(200).json("users deleted successfully");
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
  });

app.post("/add-user", async (req, res) => {
  try {
    console.log(req.body);
    const user = {
      Username: req.body.name,
      email: req.body.email,
      password: req.body.password,
      ToDo: {} // Optional: initialize empty ToDo map
    };
    await db.collection("Users").add(user); 
    res.status(200).send("User added successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.post("/add-todo/:userId", async (req, res) => {

  try {
    const userId = req.params.userId;
    const { key, value } = req.body;

    if (!key || !value) {
      return res.status(400).json({ message: "Key and value are required" });
    }

    const userRef = db.collection("Users").doc(userId);

    await userRef.update({
      [`ToDo.${key}`]: value
    });

    res.status(200).json({ message: "ToDo item added successfully" });
  } catch (error) {
    console.error("Error updating ToDo:", error);
    res.status(500).json({ message: "Failed to update ToDo", error: error.message });
  }
});


app.put("/update-todo/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const { key, value } = req.body;
  
      if (!key || !value) {
        return res.status(400).json({ message: "Key and value are required" });
      }
  
      const userRef = db.collection("Users").doc(userId);
  
      await userRef.update({
        [`ToDo.${key}`]: value
      });
  
      res.status(200).json({ message: `ToDo item "${key}" updated successfully` });
    } catch (error) {
      console.error("Error updating ToDo:", error);
      res.status(500).json({ message: "Failed to update ToDo", error: error.message });
    }
  });
  
  app.delete("/delete-todo/:userId/:key", async (req, res) => {
    try {
      const userId = req.params.userId;
      const key = req.params.key;
  
      if (!key) {
        return res.status(400).json({ message: "Key is required" });
      }
  
      const userRef = db.collection("Users").doc(userId);
  

      await userRef.update({
        [`ToDo.${key}`]: admin.firestore.FieldValue.delete()
      });
  
      res.status(200).json({ message: `ToDo item with key "${key}" deleted successfully` });
    } catch (error) {
      console.error("Error deleting ToDo:", error);
      res.status(500).json({ message: "Failed to delete ToDo", error: error.message });
    }
  });


const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
