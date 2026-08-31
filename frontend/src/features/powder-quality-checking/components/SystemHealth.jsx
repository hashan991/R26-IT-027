import { motion } from "framer-motion";

import {
  Cpu,
  Database,
  Brain,
  Server,
  CheckCircle,
  Activity,
  ShieldCheck,
  Radio,
  Sparkles,
  Wifi,
} from "lucide-react";


export default function SystemHealth() {


  const systems = [

    {
      title: "Arduino Device",
      subtitle: "IoT Sensor Controller",
      status: "Ready",
      icon: <Cpu size={22} />,
      color: "text-emerald-300",
      iconBg: "bg-emerald-400/10",
      iconBorder: "border-emerald-400/20",
      glow: "shadow-[0_0_28px_rgba(52,211,153,0.08)]",
    },

    {
      title: "Database",
      subtitle: "Production Data Storage",
      status: "Active",
      icon: <Database size={22} />,
      color: "text-blue-300",
      iconBg: "bg-blue-400/10",
      iconBorder: "border-blue-400/20",
      glow: "shadow-[0_0_28px_rgba(96,165,250,0.08)]",
    },

    {
      title: "AI Engine",
      subtitle: "Quality Decision Intelligence",
      status: "Running",
      icon: <Brain size={22} />,
      color: "text-purple-300",
      iconBg: "bg-purple-400/10",
      iconBorder: "border-purple-400/20",
      glow: "shadow-[0_0_28px_rgba(192,132,252,0.08)]",
    },

    {
      title: "API Service",
      subtitle: "Backend Communication Layer",
      status: "Online",
      icon: <Server size={22} />,
      color: "text-cyan-300",
      iconBg: "bg-cyan-400/10",
      iconBorder: "border-cyan-400/20",
      glow: "shadow-[0_0_28px_rgba(34,211,238,0.08)]",
    },

  ];


  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 30,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      transition={{
        duration: 0.6,
        ease: "easeOut",
      }}

      className="
        relative

        mt-10

        overflow-hidden

        rounded-[36px]

        border
        border-[#8B5A3C]/20

        bg-gradient-to-br
        from-[#2B1A12]
        via-[#21140E]
        to-[#180E0A]

        p-5
        sm:p-6
        lg:p-8

        shadow-[0_35px_100px_rgba(59,32,18,0.28)]
      "
    >

      {/* =====================================================
          AMBIENT BACKGROUND
      ===================================================== */}

      <div
        className="
          pointer-events-none

          absolute

          -left-28
          -top-32

          h-[400px]
          w-[400px]

          rounded-full

          bg-[#D58A50]/15

          blur-[130px]
        "
      />


      <div
        className="
          pointer-events-none

          absolute

          -right-36
          -bottom-40

          h-[420px]
          w-[420px]

          rounded-full

          bg-[#B56E42]/10

          blur-[140px]
        "
      />


      <div
        className="
          pointer-events-none

          absolute

          top-0
          left-[10%]
          right-[10%]

          h-px

          bg-gradient-to-r
          from-transparent
          via-[#D19A69]/35
          to-transparent
        "
      />


      <div className="relative z-10">


        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            mb-7

            flex
            flex-col

            gap-5

            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >


          <div
            className="
              flex
              items-center
              gap-4
            "
          >


            <motion.div

              whileHover={{
                scale: 1.06,
                rotate: 4,
              }}

              transition={{
                duration: 0.25,
              }}

              className="
                flex

                h-[58px]
                w-[58px]

                shrink-0

                items-center
                justify-center

                rounded-[20px]

                border
                border-[#D39A6A]/20

                bg-gradient-to-br
                from-[#D39A6A]/18
                to-[#D39A6A]/6

                text-[#E5A36E]

                shadow-[0_15px_35px_rgba(0,0,0,0.16)]
              "
            >

              <Activity size={26} />

            </motion.div>


            <div>


              <div
                className="
                  mb-1.5

                  flex
                  items-center
                  gap-2
                  flex-wrap
                "
              >

                <span
                  className="
                    text-[9px]

                    font-extrabold

                    uppercase

                    tracking-[0.22em]

                    text-[#D69D6C]
                  "
                >
                  Infrastructure Intelligence
                </span>


                <span
                  className="
                    h-1.5
                    w-1.5

                    rounded-full

                    bg-emerald-400

                    shadow-[0_0_10px_rgba(52,211,153,0.8)]
                  "
                />


                <span
                  className="
                    text-[9px]

                    font-bold

                    uppercase

                    tracking-[0.12em]

                    text-emerald-300
                  "
                >
                  Live
                </span>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-2.5
                  flex-wrap
                "
              >

                <h2
                  className="
                    text-[25px]
                    sm:text-[29px]

                    font-black

                    tracking-[-0.035em]

                    !text-[#FFF3DE]
                  "
                >
                  System Health
                </h2>


                <Sparkles
                  size={17}
                  className="
                    text-[#DFA26D]
                  "
                />

              </div>


              <p
                className="
                  mt-1

                  text-[13px]

                  leading-6

                  text-[#B49C89]
                "
              >
                CoffeeSense AI infrastructure monitoring
              </p>

            </div>

          </div>


          {/* =================================================
              GLOBAL STATUS
          ================================================= */}

          <motion.div

            animate={{
              boxShadow: [
                "0 0 0 rgba(52,211,153,0)",
                "0 0 28px rgba(52,211,153,0.10)",
                "0 0 0 rgba(52,211,153,0)",
              ],
            }}

            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}

            className="
              flex

              w-fit

              items-center

              gap-3

              rounded-full

              border
              border-emerald-400/20

              bg-emerald-400/[0.07]

              px-4
              py-2.5

              text-emerald-300
            "
          >

            <div className="relative">

              <span
                className="
                  block

                  h-2.5
                  w-2.5

                  rounded-full

                  bg-emerald-400

                  shadow-[0_0_12px_rgba(52,211,153,0.9)]
                "
              />

              <span
                className="
                  absolute
                  inset-0

                  animate-ping

                  rounded-full

                  bg-emerald-400

                  opacity-40
                "
              />

            </div>


            <ShieldCheck size={17} />


            <span
              className="
                whitespace-nowrap

                text-[11px]

                font-extrabold

                uppercase

                tracking-[0.12em]
              "
            >
              All Systems Operational
            </span>

          </motion.div>

        </div>


        {/* =====================================================
            SYSTEM HEALTH OVERVIEW BAR
        ===================================================== */}

        <div
          className="
            mb-6

            grid
            grid-cols-1
            gap-3

            sm:grid-cols-3
          "
        >


          <div
            className="
              flex
              items-center
              gap-3

              rounded-2xl

              border
              border-[#A87552]/15

              bg-[#3A261C]/50

              px-4
              py-3

              backdrop-blur-xl
            "
          >

            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center

                rounded-xl

                bg-[#D69863]/10

                text-[#DFA26D]
              "
            >

              <Radio size={16} />

            </div>


            <div>

              <p
                className="
                  text-[8px]

                  font-bold

                  uppercase

                  tracking-[0.15em]

                  text-[#8E7563]
                "
              >
                Services
              </p>

              <p
                className="
                  mt-0.5

                  text-sm

                  font-bold

                  text-[#F6E2CD]
                "
              >
                4 Connected
              </p>

            </div>

          </div>


          <div
            className="
              flex
              items-center
              gap-3

              rounded-2xl

              border
              border-[#A87552]/15

              bg-[#3A261C]/50

              px-4
              py-3

              backdrop-blur-xl
            "
          >

            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center

                rounded-xl

                bg-emerald-400/[0.08]

                text-emerald-300
              "
            >

              <CheckCircle size={16} />

            </div>


            <div>

              <p
                className="
                  text-[8px]

                  font-bold

                  uppercase

                  tracking-[0.15em]

                  text-[#8E7563]
                "
              >
                Health Score
              </p>

              <p
                className="
                  mt-0.5

                  text-sm

                  font-bold

                  text-emerald-300
                "
              >
                100% Healthy
              </p>

            </div>

          </div>


          <div
            className="
              flex
              items-center
              gap-3

              rounded-2xl

              border
              border-[#A87552]/15

              bg-[#3A261C]/50

              px-4
              py-3

              backdrop-blur-xl
            "
          >

            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center

                rounded-xl

                bg-[#D69863]/10

                text-[#DFA26D]
              "
            >

              <Wifi size={16} />

            </div>


            <div>

              <p
                className="
                  text-[8px]

                  font-bold

                  uppercase

                  tracking-[0.15em]

                  text-[#8E7563]
                "
              >
                Network
              </p>

              <p
                className="
                  mt-0.5

                  text-sm

                  font-bold

                  text-[#F6E2CD]
                "
              >
                Stable Connection
              </p>

            </div>

          </div>

        </div>


        {/* =====================================================
            SYSTEM CARDS
        ===================================================== */}

        <div
          className="
            grid

            grid-cols-1

            gap-4

            md:grid-cols-2
            xl:grid-cols-4
          "
        >


          {systems.map((item,index)=>(

            <motion.div

              key={index}

              initial={{
                opacity: 0,
                y: 18,
                scale: 0.97,
              }}

              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}

              transition={{
                duration: 0.45,
                delay: index * 0.08,
                ease: "easeOut",
              }}

              whileHover={{
                y: -7,
                scale: 1.02,
              }}

              className="
                group/card

                relative

                overflow-hidden

                rounded-[26px]

                border
                border-[#A87552]/15

                bg-gradient-to-br
                from-[#3A261C]/78
                via-[#302018]/82
                to-[#281A14]/92

                p-5

                shadow-[0_18px_45px_rgba(30,16,10,0.16)]

                backdrop-blur-xl

                transition-all
                duration-300

                hover:border-[#D39A6A]/25
                hover:shadow-[0_24px_60px_rgba(30,16,10,0.24)]
              "
            >


              {/* CARD AMBIENT LIGHT */}

              <div
                className="
                  pointer-events-none

                  absolute

                  -right-12
                  -top-14

                  h-32
                  w-32

                  rounded-full

                  bg-white/[0.025]

                  blur-3xl
                "
              />


              {/* ICON + LIVE */}

              <div
                className="
                  relative
                  z-10

                  mb-6

                  flex
                  items-start
                  justify-between
                "
              >


                <motion.div

                  whileHover={{
                    rotate: 5,
                    scale: 1.08,
                  }}

                  className={`
                    flex

                    h-12
                    w-12

                    items-center
                    justify-center

                    rounded-[16px]

                    border

                    ${item.iconBg}
                    ${item.iconBorder}
                    ${item.color}
                    ${item.glow}
                  `}
                >

                  {item.icon}

                </motion.div>


                <div
                  className="
                    flex
                    items-center
                    gap-1.5

                    rounded-full

                    border
                    border-emerald-400/15

                    bg-emerald-400/[0.05]

                    px-2.5
                    py-1
                  "
                >

                  <span
                    className="
                      h-1.5
                      w-1.5

                      rounded-full

                      bg-emerald-400

                      shadow-[0_0_8px_rgba(52,211,153,0.85)]

                      animate-pulse
                    "
                  />


                  <span
                    className="
                      text-[8px]

                      font-extrabold

                      uppercase

                      tracking-[0.12em]

                      text-emerald-300
                    "
                  >
                    Live
                  </span>

                </div>

              </div>


              {/* CONTENT */}

              <div
                className="
                  relative
                  z-10
                "
              >

                <h3
                  className="
                    text-[17px]

                    font-black

                    tracking-[-0.02em]

                    !text-[#FFF0DB]
                  "
                >
                  {item.title}
                </h3>


                <p
                  className="
                    mt-1

                    text-[10px]

                    leading-5

                    text-[#9C806A]
                  "
                >
                  {item.subtitle}
                </p>


                <div
                  className="
                    mt-5

                    flex
                    items-center
                    justify-between

                    gap-3
                  "
                >


                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <span
                      className="
                        relative

                        flex
                        h-2.5
                        w-2.5
                      "
                    >

                      <span
                        className="
                          absolute
                          inline-flex
                          h-full
                          w-full

                          animate-ping

                          rounded-full

                          bg-emerald-400

                          opacity-40
                        "
                      />

                      <span
                        className="
                          relative
                          inline-flex

                          h-2.5
                          w-2.5

                          rounded-full

                          bg-emerald-400
                        "
                      />

                    </span>


                    <p
                      className="
                        text-[12px]

                        font-bold

                        text-emerald-300
                      "
                    >
                      {item.status}
                    </p>

                  </div>


                  <CheckCircle
                    size={15}
                    className="
                      text-emerald-400/50

                      transition-all
                      duration-300

                      group-hover/card:text-emerald-300
                    "
                  />

                </div>

              </div>


              {/* BOTTOM STATUS LINE */}

              <div
                className="
                  absolute

                  bottom-0
                  left-5
                  right-5

                  h-px

                  bg-gradient-to-r
                  from-transparent
                  via-emerald-400/15
                  to-transparent
                "
              />

            </motion.div>

          ))}

        </div>


        {/* =====================================================
            FOOTER STATUS
        ===================================================== */}

        <div
          className="
            mt-6

            flex
            flex-col

            gap-3

            border-t
            border-[#A87552]/10

            pt-4

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >


          <p
            className="
              text-[9px]

              font-medium

              tracking-[0.04em]

              text-[#806654]
            "
          >
            CoffeeSense AI infrastructure status monitoring
          </p>


          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <Activity
              size={12}
              className="
                text-emerald-400
              "
            />


            <span
              className="
                text-[9px]

                font-bold

                uppercase

                tracking-[0.12em]

                text-emerald-300
              "
            >
              Operational
            </span>

          </div>

        </div>

      </div>

    </motion.div>

  );

}