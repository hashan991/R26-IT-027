import { motion } from "framer-motion";

export default function SensorCard({
    title,
    value,
    unit,
    icon,
    status,
    color,
    statusColor = "text-green-400",
    statusDot = "bg-green-400",
    valueColor = "text-[#FFF4DE]",
    delay = 0
}) {

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 20,
                scale: 0.95
            }}
            animate={{
                opacity: 1,
                y: 0,
                scale: 1
            }}
            transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: delay
            }}
            whileHover={{
                y: -5,
                scale: 1.02,
                transition: { duration: 0.2 }
            }}
            className="
                group
                relative
                overflow-hidden
                h-[280px]
                w-[300px]
                p-5
                rounded-[26px]

                bg-gradient-to-br
                from-[#3B2516]
                via-[#2C1A10]
                to-[#211109]

                border
                border-[#8B5A2B]/45

                transition-all
                duration-300

                flex
                flex-col

                shadow-[0_14px_35px_rgba(40,20,8,0.28)]
            "
        >

            {/* GOLD AI GLOW */}

            <div
                className="
                    absolute
                    right-[-40px]
                    top-[-40px]
                    w-44
                    h-44
                    rounded-full
                    bg-[#F6C85F]/10
                    blur-2xl
                    group-hover:bg-[#F6C85F]/18
                    transition-all
                    duration-700
                "
            />


            {/* Bottom Glow Line */}

            <div
                className="
                    absolute
                    bottom-0
                    left-0
                    w-[260px]
                    h-[1.5px]
                    bg-gradient-to-r
                    from-transparent
                    via-[#F6C85F]
                    to-transparent
                    opacity-25
                    group-hover:opacity-100
                    transition
                    duration-500
                "
            />


            {/* Decorative Corner */}

            <div
                className="
                    absolute
                    top-0
                    right-0
                    w-12
                    h-12
                    bg-gradient-to-br
                    from-[#F6C85F]/6
                    to-transparent
                    rounded-tr-[20px]
                "
            />


            {/* HEADER - Icon + LIVE Badge */}

            <div
                className="
                    relative
                    z-10
                    flex
                    justify-between
                    items-center
                "
            >

                {/* ICON */}

                <div
                    className={`
                        p-3
                        rounded-2xl

                        bg-[#FFF4DE]/[0.06]

                        border
                        border-[#D9A441]/25

                        ${color}

                        group-hover:shadow-[0_0_20px_rgba(246,200,95,0.10)]

                        transition-all
                        duration-500
                    `}
                >
                    {icon}
                </div>


                {/* LIVE BADGE */}

                <div
                    className="
                        flex
                        items-center
                        gap-1
                        px-3
                        py-1
                        rounded-full

                        bg-[#24160D]/90

                        border
                        border-[#B88645]/25

                        group-hover:border-[#D9A441]/40

                        transition
                        duration-300
                    "
                >

                    <span className="relative flex h-1.5 w-1.5">

                        <span
                            className="
                                absolute
                                inline-flex
                                h-full
                                w-full
                                rounded-full
                                bg-green-400
                                animate-ping
                                opacity-70
                            "
                        />

                        <span
                            className="
                                relative
                                inline-flex
                                rounded-full
                                h-1.5
                                w-1.5
                                bg-green-400
                                shadow-[0_0_10px_#22c55e]
                            "
                        />

                    </span>

                    <span
                        className="
                            text-[8px]
                            font-black
                            tracking-[1px]
                            text-[#86E5A0]
                        "
                    >
                        LIVE
                    </span>

                </div>

            </div>


            {/* TITLE */}

            <h3
                className="
                    relative
                    z-10
                    mt-3
                    text-[20px]
                    uppercase
                    tracking-[2px]
                    font-black

                    text-[#E3C39A]

                    group-hover:text-[#F6C85F]

                    transition
                    duration-300
                "
            >
                {title}
            </h3>


            {/* VALUE */}

            <div
                className="
                    relative
                    z-10
                    flex
                    items-end
                    gap-5
                    mt-8
                "
            >

                <h2
                    className="
                        !text-[40px]
                        font-black
                        tracking-tight

                        !text-[#FFF4DE]

                        drop-shadow-[0_0_18px_rgba(255,244,222,0.25)]

                        transition-none
                    "
                >
                    {value}
                </h2>


                <span
                    className="
                        mb-3
                        text-3xl
                        font-bold

                        text-[#F6C85F]

                        drop-shadow-[0_0_10px_rgba(246,200,95,0.25)]
                    "
                >
                    {unit}
                </span>

            </div>


            {/* STATUS - Text නොකැඩෙන විදියට */}

            <div
                className="
                    absolute
                    bottom-5
                    left-5
                    right-3
                    flex
                    justify-between
                    items-center
                "
            >

                <div className="flex items-center gap-1.5 min-w-0">

                    <span
                        className={`
                            w-1.5
                            h-1.5
                            rounded-full
                            animate-pulse
                            shadow-[0_0_12px_currentColor]
                            ${statusDot}
                            flex-shrink-0
                        `}
                    />

                    <p
                        className={`
                            font-black
                            text-[20px]
                            ${statusColor}
                            whitespace-nowrap
                        `}
                    >
                        {status}
                    </p>

                </div>


                <span
                    className="
                        text-[7px]
                        font-black
                        tracking-[1px]

                        text-[#D9A441]

                        group-hover:text-[#F6C85F]

                        transition
                        duration-300

                        whitespace-nowrap
                        flex-shrink-0
                        ml-2
                    "
                >
                    QUALITY MONITORING
                </span>

            </div>

        </motion.div>
    );
}