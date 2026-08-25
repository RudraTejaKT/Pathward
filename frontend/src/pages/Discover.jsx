import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { enrollCourse, setActiveCourse } from "../lib/coursesData.js";
import "./Discover.css";

const FEATURED_COURSES = [
  {
    id: "feat-1",
    title: "Advanced Machine Learning Algorithms",
    category: "Data Science",
    instructor: "Dr. Eleanor Vance",
    rating: 4.9,
    price: 1499,
    image:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80",
    description: "Deep dive into gradient boosting, transformers, neural networks, and reinforcement learning.",
  },
  {
    id: "feat-2",
    title: "UX/UI Foundations for Scale",
    category: "Design",
    instructor: "Marcus Thorne",
    rating: 4.8,
    price: 999,
    image:
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80",
    description: "Design systems, typography grids, accessibility, and high-fidelity interactive prototyping.",
  },
  {
    id: "feat-3",
    title: "Clinical Medicine & Diagnostic Reasoning",
    category: "Medical",
    instructor: "Dr. Arvind Swaminathan",
    rating: 4.95,
    price: 1299,
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    description: "Master bedside diagnosis, ECG interpretation, emergency triage, and clinical OSCE vignettes.",
  },
  {
    id: "feat-4",
    title: "Distributed Systems & Cloud Architecture",
    category: "Engineering",
    instructor: "Vikram Malhotra",
    rating: 4.9,
    price: 1799,
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    description: "Scale applications across Kubernetes, microservices, Kafka event streaming, and multi-region AWS.",
  },
];

const TRENDING_COURSES = [
  {
    id: "trend-1",
    title: "Growth Marketing 101",
    category: "Marketing",
    instructor: "Sarah Jenkins",
    rating: 4.7,
    duration: "4h 20m",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "trend-2",
    title: "Product Management & Roadmaps",
    category: "Business",
    instructor: "David Chen",
    rating: 4.9,
    duration: "6h 15m",
    image:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "trend-3",
    title: "Full-Stack Architecture (MERN + GraphQL)",
    category: "Engineering",
    instructor: "Elena Rodriguez",
    rating: 4.6,
    duration: "12h 45m",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "trend-4",
    title: "Financial Modeling & Valuation (DCF / LBO)",
    category: "Business",
    instructor: "Rohan Kapoor (CFA)",
    rating: 4.85,
    duration: "8h 30m",
    image:
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "trend-5",
    title: "Human Anatomy & Histopathology Lab",
    category: "Medical",
    instructor: "Prof. Priya Nair",
    rating: 4.92,
    duration: "15h 10m",
    image:
      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=400&q=80",
  },
];

const CATEGORIES = ["All", "Data Science", "Design", "Marketing", "Business", "Engineering", "Medical"];

export default function Discover() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [enrolledCourses, setEnrolledCourses] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  function handleEnroll(course) {
    const isEnrolled = enrolledCourses[course.id];
    setEnrolledCourses((prev) => ({ ...prev, [course.id]: !isEnrolled }));
    if (!isEnrolled) {
      enrollCourse(course.id);
      setActiveCourse(course.id);
    }
    setToastMessage(
      !isEnrolled
        ? `Added "${course.title}" to your learning queue & dashboard!`
        : `Removed "${course.title}" from your queue.`
    );
    setTimeout(() => setToastMessage(null), 3000);
  }

  const filteredFeatured = useMemo(() => {
    return FEATURED_COURSES.filter((c) => {
      const matchCat = selectedCategory === "All" || c.category === selectedCategory;
      const matchSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const filteredTrending = useMemo(() => {
    return TRENDING_COURSES.filter((c) => {
      const matchCat = selectedCategory === "All" || c.category === selectedCategory;
      const matchSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="discover-root">
      {/* Main Discover Content */}
      <main className="discover-main">
        {/* Toast Notification */}
        {toastMessage && <div className="discover-toast">{toastMessage}</div>}

        <div className="discover-container">
          {/* Header & Search Bar */}
          <section className="discover-search-section">
            <h1 className="discover-heading">Discover</h1>
            <div className="discover-search-wrap">
              <span className="material-symbols-outlined discover-search-icon">search</span>
              <input
                type="text"
                className="discover-search-input"
                placeholder="Search courses, skills, or instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search courses"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="discover-search-clear"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>
          </section>

          {/* Category Filter Pills */}
          <section className="discover-categories-section">
            <div className="discover-categories-scroll">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`discover-category-pill ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* Featured Courses Horizontal Carousel */}
          <section className="discover-featured-section">
            <div className="discover-section-title-row">
              <h2 className="discover-section-title">Featured</h2>
              <button
                type="button"
                className="discover-see-all-btn"
                onClick={() => setSelectedCategory("All")}
              >
                See all <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

            {filteredFeatured.length === 0 ? (
              <p className="discover-empty-text">No featured courses matching your filters.</p>
            ) : (
              <div className="discover-featured-carousel">
                {filteredFeatured.map((course) => {
                  const isAdded = !!enrolledCourses[course.id];
                  return (
                    <article className="discover-featured-card" key={course.id}>
                      <Link to={`/courses/${course.id}`} className="discover-card-img-link">
                        <div
                          className="discover-card-img"
                          style={{ backgroundImage: `url(${course.image})` }}
                        >
                          <div className="discover-card-rating">
                            <span className="material-symbols-outlined star-icon">star</span>
                            {course.rating}
                          </div>
                        </div>
                      </Link>
                      <div className="discover-card-body">
                        <span className="discover-card-tag">{course.category}</span>
                        <Link to={`/courses/${course.id}`} className="discover-card-title-link">
                          <h3 className="discover-card-title">{course.title}</h3>
                        </Link>
                        <p className="discover-card-author">{course.instructor}</p>
                        <div className="discover-card-footer">
                          <span className="discover-card-price">₹{course.price}</span>
                          <button
                            type="button"
                            className={`discover-add-btn ${isAdded ? "added" : ""}`}
                            onClick={() => handleEnroll(course)}
                            title={isAdded ? "In your queue" : "Add to learning queue"}
                          >
                            <span className="material-symbols-outlined">
                              {isAdded ? "check" : "add"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Trending Now Vertical List */}
          <section className="discover-trending-section">
            <div className="discover-section-title-row">
              <h2 className="discover-section-title">Trending Now</h2>
            </div>

            {filteredTrending.length === 0 ? (
              <p className="discover-empty-text">No trending courses found.</p>
            ) : (
              <div className="discover-trending-list">
                {filteredTrending.map((course) => {
                  return (
                    <Link to={`/courses/${course.id}`} className="discover-trending-link" key={course.id}>
                      <article className="discover-trending-item">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="discover-trending-img"
                        />
                        <div className="discover-trending-content">
                          <div className="discover-trending-header">
                            <h3 className="discover-trending-title">{course.title}</h3>
                            <span className="discover-trending-badge">
                              <span className="material-symbols-outlined trending-icon">trending_up</span>
                            </span>
                          </div>
                          <p className="discover-trending-author">{course.instructor}</p>
                          <div className="discover-trending-meta">
                          <span className="meta-rating">
                            <span className="material-symbols-outlined star-fill">star</span>
                            {course.rating}
                          </span>
                          <span className="meta-dot" />
                          <span className="meta-duration">{course.duration}</span>
                          <span className="meta-dot" />
                          <span className="meta-category">{course.category}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="discover-bottom-nav">
        <div className="discover-bottom-nav__inner">
          <Link to="/discover" className="discover-nav-tab active">
            <span className="material-symbols-outlined">explore</span>
            <span>Discover</span>
          </Link>
          <Link to="/learn" className="discover-nav-tab">
            <span className="material-symbols-outlined">school</span>
            <span>Learning</span>
          </Link>
          <Link to="/mcq" className="discover-nav-tab">
            <span className="material-symbols-outlined">quiz</span>
            <span>MCQ Lab</span>
          </Link>
          <Link to="/dashboard" className="discover-nav-tab">
            <span className="material-symbols-outlined">person</span>
            <span>Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
