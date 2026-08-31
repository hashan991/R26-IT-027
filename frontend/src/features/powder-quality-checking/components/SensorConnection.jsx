import {
  Wifi,
  WifiOff,
  Activity
} from "lucide-react";

import {
  motion
} from "framer-motion";

import {
  useEffect,
  useState
} from "react";

import apiClient from "../api/apiClient";


function SensorConnection() {


  const [connected, setConnected] = useState(false);

  const [lastData, setLastData] = useState(null);


  // =====================================================
  // CHECK REAL ARDUINO DEVICE STATUS
  // SAME LOGIC
  // =====================================================

  const checkDeviceStatus = async () => {

    try {

      const response = await apiClient.get(
        "/device/status"
      );


      const isConnected =
        Boolean(response.data?.connected);


      setConnected(isConnected);


      if (isConnected) {

        setLastData(new Date());

      }

    }

    catch (error) {

      console.error(
        "Powder sensor connection error:",
        error
      );

      setConnected(false);

    }

  };


  // =====================================================
  // DEVICE STATUS POLLING
  // SAME LOGIC
  // =====================================================

  useEffect(() => {

    checkDeviceStatus();


    const timer = setInterval(() => {

      checkDeviceStatus();

    }, 5000);


    return () => clearInterval(timer);

  }, []);


  // =====================================================
  // UI
  // =====================================================

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 25
      }}

      animate={{
        opacity: 1,
        y: 0
      }}

      transition={{
        duration: 0.7
      }}

      whileHover={{
        scale: 1.015
      }}

      className="

        relative

        overflow-hidden

        flex

        items-center

        justify-between


        rounded-[32px]


        px-8

        py-6


        /* COFFEE DARK BACKGROUND */

        bg-gradient-to-r

        from-[#2A180D]

        via-[#3A2111]

        to-[#26150B]


        border

        border-[#8B5A2B]/55


        shadow-[

          0_20px_60px_rgba(63,35,14,0.35)

        ]


        transition-all

        duration-500


        hover:border-[#D9A441]/45

        hover:shadow-[

          0_25px_70px_rgba(89,48,16,0.40)

        ]

      "

    >


      {/* =================================================
          COFFEE AMBIENT GLOW
      ================================================= */}

      <div
        className="

          pointer-events-none

          absolute

          -top-24

          left-1/4

          w-72

          h-48

          rounded-full

          bg-[#F6C85F]/7

          blur-[70px]

        "
      />


      <div
        className="

          pointer-events-none

          absolute

          -bottom-20

          right-1/4

          w-64

          h-40

          rounded-full

          bg-[#8B4513]/15

          blur-[65px]

        "
      />


      {/* =================================================
          ANIMATED SCAN LIGHT
      ================================================= */}

      <motion.div

        animate={{
          x: [
            "-120%",
            "220%"
          ]
        }}

        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear"
        }}

        className="

          pointer-events-none

          absolute

          top-0

          left-0


          h-full

          w-40


          bg-gradient-to-r

          from-transparent

          via-[#F6C85F]/10

          to-transparent


          blur-xl

        "
      />


      {/* =================================================
          LEFT CONTENT
      ================================================= */}

      <div

        className="

          relative

          z-10


          flex

          items-center

          gap-6

        "

      >


        {/* =================================================
            ICON AREA
        ================================================= */}

        <div

          className={`

            relative

            w-20

            h-20


            rounded-3xl


            flex

            items-center

            justify-center


            border


            ${
              connected

                ?

                "bg-emerald-950/65 border-emerald-500/45"

                :

                "bg-red-950/55 border-red-500/40"
            }


            shadow-inner

          `}

        >


          {/* CONNECTED PULSE */}

          {

            connected &&

            <motion.span

              animate={{

                scale: [
                  1,
                  1.5,
                  1
                ],

                opacity: [
                  0.5,
                  0,
                  0.5
                ]

              }}

              transition={{

                duration: 2,

                repeat: Infinity

              }}

              className="

                absolute

                inset-0

                rounded-3xl

                bg-green-400/25

              "

            />

          }


          {/* ICON */}

          {

            connected

              ?

              <Wifi

                size={38}

                strokeWidth={1.8}

                className="

                  relative

                  text-emerald-400

                  drop-shadow-[0_0_12px_rgba(52,211,153,0.45)]

                "

              />

              :

              <WifiOff

                size={38}

                strokeWidth={1.8}

                className="

                  relative

                  text-red-400

                  drop-shadow-[0_0_12px_rgba(248,113,113,0.35)]

                "

              />

          }


        </div>


        {/* =================================================
            TEXT
        ================================================= */}

        <div>


          <p

            className="

              text-xs

              uppercase

              tracking-[4px]

              font-black

              text-[#F6C85F]

              mb-2

            "

          >

            IoT SENSOR NETWORK

          </p>


          <h3

            className="

              text-2xl

              font-black

              text-[#FFF1D6]

              tracking-tight

              drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]

            "

          >

            Sensor Connection

          </h3>


          <p

            className="

              mt-2

              text-sm

              text-[#CBAF86]

            "

          >

            Last data received:

            <span

              className="

                ml-2

                font-semibold

                text-[#F3DFC0]

              "

            >

              {

                lastData

                  ?

                  lastData.toLocaleTimeString()

                  :

                  "--"

              }

            </span>

          </p>


        </div>


      </div>


      {/* =================================================
          STATUS
      ================================================= */}

      <motion.div

        animate={{

          opacity:

            connected

              ?

              [
                0.8,
                1,
                0.8
              ]

              :

              1

        }}

        transition={{

          duration: 2,

          repeat:
            connected
              ?
              Infinity
              :
              0

        }}

        className={`

          relative

          z-10


          flex

          items-center

          gap-4


          px-6

          py-4


          rounded-3xl


          border


          backdrop-blur-md


          ${
            connected

              ?

              `

                bg-emerald-950/55

                border-emerald-500/40

                shadow-[

                  0_0_30px_rgba(16,185,129,0.08)

                ]

              `

              :

              `

                bg-red-950/45

                border-red-500/35

                shadow-[

                  0_0_30px_rgba(239,68,68,0.08)

                ]

              `
          }

        `}

      >


        {/* STATUS DOT */}

        <div

          className="

            relative

            flex

            items-center

            justify-center

          "

        >


          <span

            className={`

              absolute

              w-5

              h-5

              rounded-full

              animate-ping


              ${
                connected

                  ?

                  "bg-green-400/35"

                  :

                  "bg-red-400/30"
              }

            `}

          />


          <span

            className={`

              relative

              block

              w-3

              h-3

              rounded-full


              ${
                connected

                  ?

                  "bg-green-400 shadow-[0_0_20px_#22c55e]"

                  :

                  "bg-red-400 shadow-[0_0_20px_#ef4444]"
              }

            `}

          />

        </div>


        {/* STATUS TEXT */}

        <div>


          <p

            className="

              text-[10px]

              uppercase

              tracking-[3px]

              text-[#BFA78A]

              font-black

            "

          >

            SYSTEM STATUS

          </p>


          <p

            className={`

              text-xl

              font-black

              tracking-tight


              ${
                connected

                  ?

                  "text-green-300"

                  :

                  "text-red-300"
              }

            `}

          >

            {

              connected

                ?

                "Connected"

                :

                "Disconnected"

            }

          </p>


        </div>


      </motion.div>


    </motion.div>

  );

}


export default SensorConnection;