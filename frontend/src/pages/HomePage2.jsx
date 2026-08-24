import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Beans Quality Checking",
      description: "Analyze raw coffee beans and identify quality defects.",
      icon: "🫘",
      path: "/beans",
    },
    {
      title: "Coffee Powder Quality Checking",
      description:
        "Evaluate coffee powder quality, moisture, color and consistency.",
      icon: "☕",
      path: "/powder",
    },
    {
      title: "Packet Quality Checking",
      description:
        "Inspect coffee packets and identify sealing and packaging defects.",
      icon: "📦",
      path: "/packaging",
    },
    {
      title: "Sales Analytics",
      description:
        "View sales performance, market trends and product analytics.",
      icon: "📊",
      path: "/sales",
    },
  ];

  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: "#f7f8f4",
      padding: "70px 8%",
      fontFamily: "Arial, sans-serif",
      boxSizing: "border-box",
    },

    header: {
      maxWidth: "800px",
      marginBottom: "50px",
    },

    smallTitle: {
      color: "#83745c",
      fontSize: "13px",
      letterSpacing: "3px",
      fontWeight: "700",
      marginBottom: "15px",
    },

    heading: {
      fontSize: "48px",
      lineHeight: "1.15",
      color: "#252525",
      margin: "0 0 20px 0",
    },

    headingHighlight: {
      color: "#795548",
    },

    description: {
      fontSize: "17px",
      color: "#686868",
      lineHeight: "1.7",
      maxWidth: "700px",
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
      gap: "22px",
    },

    card: {
      backgroundColor: "#ffffff",
      border: "1px solid #e6e6e6",
      borderRadius: "18px",
      padding: "30px",
      cursor: "pointer",
      boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
      transition: "all 0.3s ease",
    },

    icon: {
      width: "58px",
      height: "58px",
      backgroundColor: "#f4eee9",
      borderRadius: "14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "28px",
      marginBottom: "25px",
    },

    cardTitle: {
      fontSize: "20px",
      color: "#262626",
      marginBottom: "14px",
    },

    cardDescription: {
      color: "#757575",
      fontSize: "14px",
      lineHeight: "1.6",
      minHeight: "70px",
    },

    button: {
      marginTop: "15px",
      border: "none",
      backgroundColor: "#795548",
      color: "white",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
      padding: "10px 16px",
      borderRadius: "8px",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.smallTitle}>SMART COFFEE MANUFACTURING</p>

        <h1 style={styles.heading}>
          Coffee Quality
          <span style={styles.headingHighlight}> Control Dashboard</span>
        </h1>

        <p style={styles.description}>
          Monitor coffee quality from raw beans to final packaging and analyze
          sales performance from one intelligent platform.
        </p>
      </div>

      <div style={styles.grid}>
        {modules.map((module, index) => (
          <div
            key={index}
            style={styles.card}
            onClick={() => navigate(module.path)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-7px)";
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.10)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 5px 20px rgba(0,0,0,0.05)";
            }}
          >
            <div style={styles.icon}>{module.icon}</div>

            <h2 style={styles.cardTitle}>{module.title}</h2>

            <p style={styles.cardDescription}>{module.description}</p>

            <button
              style={styles.button}
              onClick={(e) => {
                e.stopPropagation();
                navigate(module.path);
              }}
            >
              Open Module →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
