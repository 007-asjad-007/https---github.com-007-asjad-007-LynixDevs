// Initialize Firebase (Add your Firebase config here if not already initialized in the HTML)
const firebaseConfig = {
  apiKey: "AIzaSyCaSvqojxACumpR20vmnC_7yhuYakuE3pM",
  authDomain: "tidy-scapes.firebaseapp.com",
  projectId: "tidy-scapes",
  storageBucket: "tidy-scapes.firebasestorage.app",
  messagingSenderId: "965946993878",
  appId: "1:965946993878:web:9c2f8b6efdf29f49156d77",
  measurementId: "G-1HN63BH8Z1",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const blogsContainer = document.getElementById("blogsContainer");
const editModal = document.getElementById("editModal");
const editBlogForm = document.getElementById("editBlogForm");
const cancelEditButton = document.getElementById("cancelEdit");
const createBlogForm = document.getElementById("createBlogForm"); // Add this line to get the form
const titleField = document.getElementById("title"); // Add this to get the title input field
const authorField = document.getElementById("author"); // Add this to get the author input field
const categoriesField = document.getElementById("categories"); // Add this for categories
const contentField = document.getElementById("content"); // Add this for content
const imageURLField = document.getElementById("imageURL"); // Add this for image URL
const dateField = document.getElementById("date"); // Add this for date

// Fetch existing blogs and display them
async function fetchBlogs() {
  try {
    const querySnapshot = await db
      .collection("blogs")
      .orderBy("date", "desc")
      .get();
    blogsContainer.innerHTML = ""; // Clear the current list

    querySnapshot.forEach((doc) => {
      const blog = doc.data();
      const blogId = doc.id;

      // Create a blog card
      const blogCard = document.createElement("div");
      blogCard.classList.add("blog-card");
      blogCard.innerHTML = `
            <h3>${blog.title}</h3>
            <p>${blog.content.substring(0, 100)}...</p>
            <p><strong>Author:</strong> ${blog.author || "Unknown Author"}</p>
            <p><strong>Categories:</strong> ${
              Array.isArray(blog.categories) && blog.categories.length > 0
                ? blog.categories.join(", ")
                : "No categories available"
            }</p>
            <img src="${blog.imageURL || "default-image.jpg"}" alt="${
        blog.title
      }" style="width: 100px; height: auto;" />
            <p><strong>Date:</strong> ${
              blog.date
                ? new Date(blog.date.seconds * 1000).toLocaleDateString(
                    "en-US",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )
                : "No date available"
            }</p>
            <button onclick="deleteBlog('${blogId}')">Delete</button>
            <button onclick="showEditForm('${blogId}')">Edit</button>
          `;

      // Append blog card to the container
      blogsContainer.appendChild(blogCard);
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
  }
}

// Add a new blog post to the database
createBlogForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the values from the form fields
  const title = titleField.value;
  const author = authorField.value;
  const categories = categoriesField.value.split(",").map((c) => c.trim());
  const content = contentField.value;
  const imageURL = imageURLField.value;
  const date = dateField.value;

  // Check if all required fields are filled
  if (!title || !author || !content || !imageURL || !date) {
    alert("Please fill in all the fields.");
    return;
  }

  const newBlog = {
    title,
    author,
    categories,
    content,
    imageURL,
    date: firebase.firestore.Timestamp.fromDate(new Date(date)), // Convert date to Firestore timestamp
  };

  try {
    // Add the new blog post to the Firestore database
    await db.collection("blogs").add(newBlog);
    alert("New blog post created successfully!");
    createBlogForm.reset(); // Reset the form

    // Refresh the list of blogs
    fetchBlogs();
  } catch (error) {
    console.error("Error creating new blog post:", error);
    alert("Error creating new blog post.");
  }
});

// Show the edit form modal with pre-filled data
async function showEditForm(blogId) {
  const docRef = db.collection("blogs").doc(blogId);
  const doc = await docRef.get();

  if (doc.exists) {
    const blog = doc.data();

    // Populate form with existing data
    document.getElementById("editBlogId").value = blogId;
    document.getElementById("editTitle").value = blog.title || "";
    document.getElementById("editAuthor").value = blog.author || "";
    document.getElementById("editCategories").value = blog.categories
      ? blog.categories.join(", ")
      : "";
    document.getElementById("editContent").value = blog.content || "";
    document.getElementById("editImageURL").value = blog.imageURL || "";
    document.getElementById("editDate").value = blog.date
      ? new Date(blog.date.seconds * 1000).toISOString().split("T")[0]
      : "";

    // Show the modal
    editModal.style.display = "block";
  } else {
    alert("Blog not found.");
  }
}

// Save changes made in the edit form
editBlogForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const blogId = document.getElementById("editBlogId").value;
  const updatedData = {
    title: document.getElementById("editTitle").value,
    author: document.getElementById("editAuthor").value,
    categories: document
      .getElementById("editCategories")
      .value.split(",")
      .map((c) => c.trim()),
    content: document.getElementById("editContent").value,
    imageURL: document.getElementById("editImageURL").value,
    date: firebase.firestore.Timestamp.fromDate(
      new Date(document.getElementById("editDate").value)
    ),
  };

  try {
    await db.collection("blogs").doc(blogId).update(updatedData);
    alert("Blog updated successfully!");
    editModal.style.display = "none"; // Hide the modal
    fetchBlogs(); // Refresh the list
  } catch (error) {
    console.error("Error updating blog:", error);
    alert("There was an error updating the blog.");
  }
});

// Cancel editing
cancelEditButton.addEventListener("click", () => {
  editModal.style.display = "none"; // Hide the modal
});

// Delete a blog
async function deleteBlog(blogId) {
  if (confirm("Are you sure you want to delete this blog?")) {
    try {
      await db.collection("blogs").doc(blogId).delete();
      alert("Blog deleted successfully!");
      fetchBlogs(); // Refresh the list
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("There was an error deleting the blog.");
    }
  }
}

// Fetch blogs on page load
fetchBlogs();
