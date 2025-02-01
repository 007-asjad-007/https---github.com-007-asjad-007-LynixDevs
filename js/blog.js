document.addEventListener("DOMContentLoaded", async function () {
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

  const blogContentContainer = document.querySelector(".blog-content");
  const categoriesContainer = document.querySelector(".blog-categories");
  const recentBlogsContainer = document.querySelector(
    ".recent-blogs-container"
  );

  // Fetch blog ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const blogId = urlParams.get("id");

  if (!blogId) {
    console.error("Blog ID not found in URL");
    return;
  }

  try {
    // Fetch main blog content
    const blogDoc = await db.collection("blogs").doc(blogId).get();
    if (blogDoc.exists) {
      const blog = blogDoc.data();

      // Main blog content
      blogContentContainer.querySelector(".blog-title").innerHTML = `${
        blog.title || "Untitled Blog"
      }`;
      blogContentContainer.querySelector(".blog-image").src = `${
        blog.imageURL || "default-image.jpg"
      }`;

      // Format the blog content
      const rawContent = blog.content || "No content available.";
      const formattedContent = rawContent
        .split(/\n{2,}/) // Split content into paragraphs on double line breaks
        .map((paragraph) => `<p>${paragraph.trim()}</p>`) // Wrap each paragraph in <p> tags
        .join(""); // Join all paragraphs back into a single string

      blogContentContainer.querySelector(".blog-body").innerHTML =
        formattedContent;

      blogContentContainer.querySelector(".blog-author-date").innerHTML = `By ${
        blog.author || "Unknown Author"
      } | ${
        blog.date
          ? new Date(blog.date.seconds * 1000).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "Unknown Date"
      }`;

      // Categories
      if (Array.isArray(blog.categories) && blog.categories.length > 0) {
        categoriesContainer.innerHTML = blog.categories
          .map((category) => `<li class="category">${category}</li>`)
          .join("");
      } else {
        categoriesContainer.innerHTML = "<p>No categories available.</p>";
      }
    } else {
      blogContentContainer.innerHTML = "<p>Blog not found.</p>";
    }

    // Fetch recent blogs
    const snapshot = await db
      .collection("blogs")
      .orderBy("date", "desc")
      .limit(5)
      .get();
    snapshot.forEach((doc) => {
      const blog = doc.data();

      // Create container for each recent blog
      const blogCard = document.createElement("div");
      blogCard.classList.add("recent-blog-card");

      // Blog image
      const blogImage = document.createElement("img");
      blogImage.classList.add("recent-blog-image");
      blogImage.src = blog.imageURL || "default-image.jpg";
      blogImage.alt = blog.title || "Recent Blog";

      // Blog details
      const blogDetails = document.createElement("div");
      blogDetails.classList.add("recent-blog-details");

      // Blog title
      const blogTitle = document.createElement("a");
      blogTitle.classList.add("recent-blog-title");
      blogTitle.href = `blog-detail.html?id=${doc.id}`;
      blogTitle.textContent = blog.title || "Untitled Blog";

      // Blog meta (author and date)
      const blogMeta = document.createElement("p");
      blogMeta.classList.add("recent-blog-meta");
      blogMeta.textContent = `${blog.author || "Unknown Author"} | ${
        blog.date
          ? new Date(blog.date.seconds * 1000).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "Unknown Date"
      }`;

      // Append title and meta to blog details
      blogDetails.appendChild(blogTitle);
      blogDetails.appendChild(blogMeta);

      // Append image and details to the blog card
      blogCard.appendChild(blogImage);
      blogCard.appendChild(blogDetails);

      // Append blog card to the recent blogs container
      recentBlogsContainer.appendChild(blogCard);
    });

    // ✅ Set meta tags only once for the main blog, outside the loop
    document.title = blog.title + " | Your Website Name";

    document
      .querySelector('meta[name="description"]')
      .setAttribute("content", blog.excerpt || "Default description here");

    document
      .querySelector('meta[property="og:title"]')
      .setAttribute("content", blog.title);
    document
      .querySelector('meta[property="og:description"]')
      .setAttribute("content", blog.excerpt || "Default description here");
    document
      .querySelector('meta[property="og:image"]')
      .setAttribute("content", blog.imageURL || "default-image.jpg");
    document
      .querySelector('meta[property="og:url"]')
      .setAttribute("content", window.location.href);
  } catch (error) {
    console.error("Error fetching blog data:", error);
  }
});
