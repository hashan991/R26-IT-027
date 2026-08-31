import { motion } from "framer-motion";

export default function StatCard({
    title,
    value,
    icon,
    color
}) {

    return (

        <motion.div

            initial={{
                opacity: 0,
                y: 40
            }}

            animate={{
                opacity: 1,
                y: 0
            }}

            whileHover={{
                scale: 1.05,
                y: -5
            }}

            className="
                group
                relative
                overflow-hidden

                p-6

                rounded-3xl

                /* =========================================
                   DARK COFFEE THEME BACKGROUND
                ========================================= */

                bg-gradient-to-br
                from-[#2A180D]
                via-[#1D1009]
                to-[#120805]

                border
                border-[#A86624]/35

                backdrop-blur-xl

                shadow-[0_15px_40px_rgba(40,20,8,0.28)]

                transition-all
                duration-500

                hover:border-[#C8892E]/55

                hover:shadow-[0_20px_50px_rgba(82,42,12,0.38)]
            "

        >


            {/* =================================================
                PREMIUM COFFEE AMBIENT GLOW
            ================================================= */}

            <div
                className="
                    absolute

                    right-[-25px]
                    top-[-25px]

                    w-32
                    h-32

                    bg-[#D9A441]/12

                    rounded-full

                    blur-3xl

                    opacity-70

                    group-hover:opacity-100

                    group-hover:scale-110

                    transition-all
                    duration-700
                "
            />


            {/* =================================================
                SECONDARY WARM COFFEE GLOW
            ================================================= */}

            <div
                className="
                    absolute

                    left-[-35px]
                    bottom-[-45px]

                    w-32
                    h-32

                    rounded-full

                    bg-[#8B4F20]/10

                    blur-3xl

                    opacity-60

                    group-hover:opacity-90

                    transition-all
                    duration-700
                "
            />


            {/* =================================================
                SUBTLE GOLD BOTTOM LINE
            ================================================= */}

            <div
                className="
                    absolute

                    bottom-0
                    left-6
                    right-6

                    h-px

                    bg-gradient-to-r
                    from-transparent
                    via-[#C8892E]/45
                    to-transparent

                    opacity-60

                    group-hover:opacity-100

                    transition-opacity
                    duration-500
                "
            />


            {/* =================================================
                DECORATIVE CORNER
            ================================================= */}

            <div
                className="
                    absolute

                    right-0
                    top-0

                    w-20
                    h-20

                    bg-gradient-to-br
                    from-[#D9A441]/8
                    to-transparent

                    rounded-bl-[60px]

                    pointer-events-none
                "
            />


            {/* =================================================
                CONTENT
            ================================================= */}

            <div
                className="
                    relative
                    z-10
                "
            >


                {/* =================================================
                    ICON
                ================================================= */}

                <div
                    className={`
                        ${color}

                        p-3

                        rounded-2xl

                        bg-[#241309]/80

                        border
                        border-[#C8892E]/25

                        shadow-[0_8px_20px_rgba(0,0,0,0.22)]

                        group-hover:bg-[#301A0C]

                        group-hover:border-[#D9A441]/45

                        group-hover:shadow-[0_0_22px_rgba(217,164,65,0.12)]

                        transition-all
                        duration-500
                    `}
                >
                    {icon}
                </div>


                {/* =================================================
                    TITLE
                ================================================= */}

                <p
                    className="
                        mt-6

                        text-[#C9A77D]

                        font-medium

                        tracking-wide

                        group-hover:text-[#D9B98F]

                        transition-colors
                        duration-300
                    "
                >
                    {title}
                </p>


                {/* =================================================
                    VALUE
                ================================================= */}

                <h2
                    className="
                        text-4xl

                        font-bold

                        mt-2

                        text-[#FFF1D6]

                        tracking-tight

                        drop-shadow-[0_2px_8px_rgba(255,241,214,0.12)]

                        group-hover:text-[#FFE2A8]

                        transition-colors
                        duration-300
                    "
                >
                    {value}
                </h2>


                {/* =================================================
                    GOLD ACCENT
                ================================================= */}

                <div
                    className="
                        mt-4

                        w-9
                        h-1

                        rounded-full

                        bg-gradient-to-r
                        from-[#A9651B]
                        via-[#D9A441]
                        to-[#E8BE68]

                        opacity-70

                        group-hover:w-14

                        group-hover:opacity-100

                        transition-all
                        duration-500
                    "
                />

            </div>


            {/* =================================================
                BOTTOM DECORATIVE GLOW
            ================================================= */}

            <div
                className="
                    absolute

                    bottom-[-55px]
                    right-[-35px]

                    w-32
                    h-32

                    rounded-full

                    bg-[#B87325]/8

                    blur-3xl

                    pointer-events-none
                "
            />


        </motion.div>

    );
}