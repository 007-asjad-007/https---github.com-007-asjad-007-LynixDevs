document.addEventListener("DOMContentLoaded", function () {
  const blogsContainer = document.querySelector(".blogs-container");

  if (blogsContainer) {
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

    db.collection("blogs")
      .get()
      .then((snapshot) => {
        blogsContainer.innerHTML = ""; // Clear previous blogs

        snapshot.forEach((doc) => {
          const blog = doc.data();
          const blogDate =
            blog.date && blog.date.seconds
              ? new Date(blog.date.seconds * 1000)
              : null;

          const formattedDate = blogDate
            ? {
                day: blogDate.getDate(),
                month: blogDate.toLocaleString("default", { month: "long" }),
                year: blogDate.getFullYear(),
              }
            : { day: "Unknown", month: "", year: "" };

          // Create a single blog card container
          const blogCard = document.createElement("div");
          blogCard.classList.add("blog-card");

          blogCard.innerHTML = `
              <div class="blog-date">
                <span class="day">${formattedDate.day}</span>
                <span class="month-year">${formattedDate.month} ${
            formattedDate.year
          }</span>
              </div>
              <img src="${blog.imageURL}" alt="${
            blog.title
          }" class="blog-image">
              <div class="blog-details">
                <h3 class="blog-title">${blog.title}</h3>
                <p class="blog-excerpt">${blog.content.substring(0, 100)}...</p>
                <a href="blog-detail.html?id=${
                  doc.id
                }" class="read-more">Read more</a>
              </div>
            `;

          // Append the blog card to the blogs container
          blogsContainer.appendChild(blogCard);

          // Loader
          // Show loader when the page loads
          document.getElementById("loader").style.display = "flex";

          // Fetch blog data from Firebase
          firebase
            .firestore()
            .collection("blogs")
            .get()
            .then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                let blogData = doc.data();
                // Process and display blog data...
              });

              // Hide loader after data is loaded
              document.getElementById("loader").style.display = "none";
            })
            .catch((error) => {
              console.error("Error fetching blogs:", error);
              document.getElementById("loader").style.display = "none";
            });
        });
      })
      .catch((error) => {
        console.error("Error fetching blogs:", error);
      });
  } else {
    console.log("blogsContainer not found.");
  }
});
