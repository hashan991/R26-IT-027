import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";


function AnimatedNumber({ value }) {

    const [count, setCount] = useState(0);


    useEffect(() => {

        let start = 0;

        const duration = 900;
        const increment = value / (duration / 20);


        const timer = setInterval(() => {

            start += increment;


            if (start >= value) {

                start = value;
                clearInterval(timer);

            }


            setCount(Math.floor(start));


        }, 20);


        return () => clearInterval(timer);


    }, [value]);


    return count;

}




export default function RGBCard({

    red = 0,
    green = 0,
    blue = 0

}) {


    const colors = [

        {
            name: "RED",
            value: Number(red),
            text: "text-red-400",
            bar: "from-red-400 via-rose-400 to-red-500",
            dot: "bg-red-400"
        },

        {
            name: "GREEN",
            value: Number(green),
            text: "text-emerald-400",
            bar: "from-emerald-400 via-green-400 to-emerald-500",
            dot: "bg-emerald-400"
        },

        {
            name: "BLUE",
            value: Number(blue),
            text: "text-blue-400",
            bar: "from-blue-400 via-cyan-400 to-blue-500",
            dot: "bg-blue-400"
        }

    ];


    const maxValue = Math.max(
        ...colors.map(c => c.value),
        1
    );


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


            whileHover={{
                y: -5
            }}


            transition={{
                duration: .6,
                ease: "easeOut"
            }}


            className="

                relative

                overflow-hidden


                rounded-[28px]


                p-7


                /* COFFEE DARK THEME BACKGROUND */

                bg-gradient-to-br

                from-[#2A180D]

                via-[#3A2111]

                to-[#1E0F08]


                border

                border-[#F6C85F]/20


                shadow-[0_15px_50px_rgba(45,23,10,0.45)]


                group

            "


        >


            {/* ambient glow */}

            <motion.div


                animate={{

                    x: [0, 30, 0],
                    y: [0, -20, 0]

                }}


                transition={{

                    duration: 8,
                    repeat: Infinity

                }}


                className="

                    absolute

                    right-10
                    top-10

                    w-48
                    h-48

                    rounded-full

                    bg-[#F6C85F]/10

                    blur-[80px]

                "

            />


            {/* scanning line */}


            <motion.div


                animate={{

                    y: ["0%", "250%"]

                }}


                transition={{

                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"

                }}


                className="

                    absolute

                    left-0

                    w-full

                    h-[2px]

                    bg-gradient-to-r

                    from-transparent

                    via-[#F6C85F]/40

                    to-transparent


                    opacity-40

                "

            />


            <div className="relative z-10">


                {/* RGB DATA */}


                <div className="space-y-6">


                    {

                        colors.map((item, index) => (


                            <motion.div


                                key={item.name}


                                initial={{

                                    opacity: 0,
                                    x: -15

                                }}


                                animate={{

                                    opacity: 1,
                                    x: 0

                                }}


                                transition={{

                                    delay: index * 0.15

                                }}


                            >


                                <div

                                    className="

                                        flex

                                        justify-between

                                        items-center

                                        mb-3

                                    "

                                >


                                    <div

                                        className="

                                            flex

                                            items-center

                                            gap-3

                                        "

                                    >


                                        <motion.div


                                            animate={{

                                                scale: [
                                                    1,
                                                    1.25,
                                                    1
                                                ]

                                            }}


                                            transition={{

                                                duration: 2,
                                                repeat: Infinity

                                            }}


                                            className={`

                                                w-2.5

                                                h-2.5

                                                rounded-full

                                                ${item.dot}

                                                shadow-lg

                                            `}


                                        />


                                        <span

                                            className="

                                                text-[#F3DFC4]

                                                font-semibold

                                                tracking-wide

                                            "

                                        >

                                            {item.name}

                                        </span>


                                    </div>


                                    <span

                                        className={`

                                            text-xl

                                            font-black

                                            ${item.text}

                                        `}

                                    >


                                        <AnimatedNumber

                                            value={item.value}

                                        />


                                    </span>


                                </div>


                                <div

                                    className="

                                        relative

                                        h-3

                                        rounded-full

                                        bg-[#160B06]/80

                                        border

                                        border-white/5

                                        overflow-hidden

                                    "

                                >


                                    <motion.div


                                        initial={{

                                            width: 0

                                        }}


                                        animate={{

                                            width: `${

                                                (item.value / maxValue) * 100

                                            }%`

                                        }}


                                        transition={{

                                            duration: 1.2,
                                            delay: index * .2

                                        }}


                                        className={`

                                            h-full

                                            rounded-full

                                            bg-gradient-to-r

                                            ${item.bar}

                                            relative

                                            overflow-hidden

                                        `}


                                    />


                                    {/* moving shine */}

                                    <motion.div


                                        animate={{

                                            x: [
                                                "-100%",
                                                "200%"
                                            ]

                                        }}


                                        transition={{

                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear"

                                        }}


                                        className="

                                            absolute

                                            top-0

                                            left-0

                                            h-full

                                            w-20

                                            bg-white/30

                                            blur-md

                                        "

                                    />


                                </div>


                            </motion.div>


                        ))

                    }


                </div>


                {/* AI STATUS */}


                <motion.div


                    initial={{

                        opacity: 0

                    }}


                    animate={{

                        opacity: 1

                    }}


                    transition={{

                        delay: 0.8

                    }}


                    className="

                        mt-7

                        flex

                        items-center

                        gap-3

                    "


                >


                    <div

                        className="

                            relative

                        "

                    >


                        <CheckCircle2

                            size={22}

                            className="text-green-400"

                        />


                        <motion.div


                            animate={{

                                scale: [
                                    1,
                                    1.6,
                                    1
                                ],

                                opacity: [
                                    0.6,
                                    0,
                                    0.6
                                ]

                            }}


                            transition={{

                                duration: 2,
                                repeat: Infinity

                            }}


                            className="

                                absolute

                                inset-0

                                rounded-full

                                bg-green-400

                            "

                        />


                    </div>


                    <div>


                        <div

                            className="

                                flex

                                items-center

                                gap-2

                            "

                        >


                            <p

                                className="

                                    text-green-400

                                    font-bold

                                    text-sm

                                "

                            >

                                AI Analysis Complete

                            </p>


                            <Sparkles

                                size={14}

                                className="text-[#F6C85F]"

                            />


                        </div>


                        <p

                            className="

                                text-xs

                                text-[#BFA78A]

                                mt-1

                            "

                        >

                            Coffee colour fingerprint verified

                        </p>


                    </div>


                </motion.div>


            </div>


        </motion.div>

    );

}