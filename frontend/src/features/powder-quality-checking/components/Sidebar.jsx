import { Coffee, LayoutDashboard, Database, BarChart3 } from "lucide-react";

import { motion } from "framer-motion";

import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const location = useLocation();

  const menu = [
    {
      name: "Dashboard",
      path: "/powder",
      icon: <LayoutDashboard size={22} />,
    },

    {
      name: "Batch Intelligence",
      path: "/powder/batch-intelligence",
      icon: <Database size={22} />,
    },

    {
      name: "Production Intelligence",
      path: "/powder/production-intelligence",
      icon: <BarChart3 size={22} />,
    },
  ];

  return (
    <motion.aside
      initial={{
        x: -80,
        opacity: 0,
      }}
      animate={{
        x: 0,
        opacity: 1,
      }}
      transition={{
        duration: 0.5,
      }}
      className="
fixed
left-0
top-0
w-72
min-h-screen
bg-[#080808]
border-r
border-white/10
p-6
z-50
flex
flex-col
"
    >
      {/* BRAND */}

      <div
        className="
flex
items-center
gap-4
mb-12
"
      >
        <div
          className="
p-3
rounded-2xl
bg-yellow-400/10
border
border-yellow-400/20
"
        >
          <Coffee
            className="
text-yellow-400
"
            size={30}
          />
        </div>

        <div>
          <h1
            className="
text-xl
font-bold
text-white
tracking-wide
"
          >
            CoffeeSense
          </h1>

          <p
            className="
text-xs
text-gray-500
mt-1
"
          >
            AI Coffee Intelligence
          </p>
        </div>
      </div>

      {/* NAVIGATION */}

      <nav
        className="
space-y-3
flex-1
"
      >
        {menu.map((item, index) => {
          const active = location.pathname === item.path;

          return (
            <motion.button
              key={index}
              onClick={() => navigate(item.path)}
              whileHover={{
                x: 6,
              }}
              whileTap={{
                scale: 0.96,
              }}
              className={`

relative

w-full

flex

items-center

gap-4

px-5

py-4

rounded-2xl

text-left

transition-all

duration-300



${
  active
    ? `

bg-gradient-to-r

from-yellow-400/20

to-orange-500/20


border

border-yellow-400/40


text-yellow-400


shadow-lg

shadow-yellow-500/10

`
    : `

text-gray-300

hover:bg-white/5

`
}



`}
            >
              <motion.div
                animate={
                  active
                    ? {
                        scale: 1.12,
                      }
                    : {
                        scale: 1,
                      }
                }
                transition={{
                  duration: 0.2,
                }}
              >
                {item.icon}
              </motion.div>

              <span
                className="
font-semibold
text-sm
"
              >
                {item.name}
              </span>

              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="
absolute
right-4
w-2
h-2
rounded-full
bg-yellow-400
"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* SYSTEM STATUS */}

      <div
        className="
mb-6
bg-white/5
border
border-white/10
rounded-2xl
p-4
"
      >
        <div
          className="
flex
items-center
gap-2
text-green-400
text-sm
font-semibold
"
        >
          <span
            className="
w-2
h-2
rounded-full
bg-green-400
animate-pulse
"
          ></span>
          System Online
        </div>

        <p
          className="
text-xs
text-gray-500
mt-2
"
        >
          IoT + AI Monitoring Active
        </p>
      </div>

      {/* FOOTER */}

      <div
        className="
text-xs
text-gray-600
"
      >
        CoffeeSense AI™
        <br />
        Industrial Intelligence Platform
        <br />
        v1.0
      </div>
    </motion.aside>
  );
}
