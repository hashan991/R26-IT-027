import React, {
  useState
} from "react";

import {
  FileDown,
  Loader2,
  CheckCircle,
  AlertCircle,
  Brain,
  Activity,
  PackageCheck,
  Coffee,
  ShieldCheck
} from "lucide-react";

import {
  motion
} from "framer-motion";

import {
  pdf
} from "@react-pdf/renderer";

import AIQualityReportPDF from "./AIQualityReportPDF";





function PDFReportButton({

  reportData,

  batchId

}) {


  const [
    loading,
    setLoading
  ] = useState(false);


  const [
    success,
    setSuccess
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");



  // ======================================================
  // GENERATE PDF
  // ======================================================

  const generatePDF = async () => {


    try {


      setLoading(true);

      setSuccess(false);

      setError("");



      if (!reportData) {

        throw new Error(
          "No report data available"
        );

      }



      const blob = await pdf(

        <AIQualityReportPDF

          data={{

            report: reportData,

            batchId: batchId

          }}

        />

      ).toBlob();



      const url =
        window.URL.createObjectURL(blob);


      const link =
        document.createElement("a");


      link.href = url;


      link.download =
        `CoffeeSense_AI_Report_${batchId || "Batch"}.pdf`;


      document.body.appendChild(link);


      link.click();


      document.body.removeChild(link);


      window.URL.revokeObjectURL(url);



      setSuccess(true);


      setTimeout(() => {

        setSuccess(false);

      }, 3000);


    }

    catch (err) {


      console.error(
        "PDF Generation Error:",
        err
      );


      setError(
        "Unable to generate AI report"
      );


    }

    finally {


      setLoading(false);


    }


  };





  return (

    <motion.section

      initial={{
        opacity: 0,
        y: 20
      }}

      animate={{
        opacity: 1,
        y: 0
      }}

      transition={{
        duration: 0.5,
        ease: "easeOut"
      }}

      className="
        relative

        mt-9

        overflow-hidden

        rounded-[32px]

        border
        border-[#9E6844]/20

        bg-gradient-to-br
        from-[#3A2418]
        via-[#2D1A11]
        to-[#1D100A]

        p-5
        sm:p-6
        lg:p-7

        shadow-[0_26px_75px_rgba(56,29,13,0.24)]
      "
    >


      {/* ======================================================
          AMBIENT LIGHT
      ====================================================== */}

      <div
        className="
          pointer-events-none

          absolute
          -right-28
          -top-32

          h-[320px]
          w-[320px]

          rounded-full

          bg-[#D69756]/10

          blur-[110px]
        "
      />


      <div
        className="
          pointer-events-none

          absolute
          -bottom-28
          left-[15%]

          h-[250px]
          w-[340px]

          rounded-full

          bg-[#B97242]/7

          blur-[105px]
        "
      />


      <div className="relative z-10">


        {/* ======================================================
            MAIN REPORT ROW
        ====================================================== */}

        <div
          className="
            flex
            flex-col

            gap-6

            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >


          {/* ==================================================
              LEFT CONTENT
          ================================================== */}

          <div
            className="
              flex
              items-start

              gap-4

              min-w-0
            "
          >


            <motion.div

              whileHover={{
                rotate: 4,
                scale: 1.05
              }}

              transition={{
                duration: 0.2
              }}

              className="
                flex

                h-[56px]
                w-[56px]

                shrink-0

                items-center
                justify-center

                rounded-[18px]

                border
                border-[#D79860]/22

                bg-gradient-to-br
                from-[#D79860]/18
                to-[#A95F35]/8

                text-[#EDAD75]

                shadow-[0_12px_30px_rgba(0,0,0,0.14)]
              "
            >

              <Coffee size={24} />

            </motion.div>


            <div className="min-w-0">


              <p
                className="
                  text-[9px]

                  font-black

                  uppercase

                  tracking-[0.22em]

                  text-[#D69C6C]
                "
              >
                AI REPORT ENGINE
              </p>


              <h2
                className="
                  mt-2

                  text-[23px]
                  sm:text-[27px]

                  font-black

                  tracking-[-0.04em]

                  !text-[#FFF0DA]
                "
              >
                CoffeeSense AI Report
              </h2>


              <p
                className="
                  mt-2

                  max-w-xl

                  text-[12px]
                  sm:text-[13px]

                  leading-6

                  text-[#C1A38C]
                "
              >
                Premium AI-powered production quality documentation
                for industrial coffee batch evaluation.
              </p>


              {/* ==============================================
                  REPORT CONTENT TAGS
              ============================================== */}

              <div
                className="
                  mt-5

                  flex
                  flex-wrap

                  gap-2.5
                "
              >


                <div
                  className="
                    inline-flex

                    items-center

                    gap-2

                    rounded-full

                    border
                    border-[#A97755]/15

                    bg-white/[0.035]

                    px-3.5
                    py-2

                    text-[8px]

                    font-black

                    uppercase

                    tracking-[0.08em]

                    text-[#CFB29B]
                  "
                >

                  <Brain size={12} />

                  AI Decision

                </div>


                <div
                  className="
                    inline-flex

                    items-center

                    gap-2

                    rounded-full

                    border
                    border-[#A97755]/15

                    bg-white/[0.035]

                    px-3.5
                    py-2

                    text-[8px]

                    font-black

                    uppercase

                    tracking-[0.08em]

                    text-[#CFB29B]
                  "
                >

                  <Activity size={12} />

                  Sensor Evidence

                </div>


                <div
                  className="
                    inline-flex

                    items-center

                    gap-2

                    rounded-full

                    border
                    border-[#A97755]/15

                    bg-white/[0.035]

                    px-3.5
                    py-2

                    text-[8px]

                    font-black

                    uppercase

                    tracking-[0.08em]

                    text-[#CFB29B]
                  "
                >

                  <PackageCheck size={12} />

                  Batch Summary

                </div>


              </div>


              {/* ERROR */}

              {error && (

                <motion.div

                  initial={{
                    opacity: 0,
                    y: -4
                  }}

                  animate={{
                    opacity: 1,
                    y: 0
                  }}

                  className="
                    mt-4

                    flex
                    items-center

                    gap-2

                    rounded-xl

                    border
                    border-red-400/20

                    bg-red-400/[0.07]

                    px-3
                    py-2.5

                    text-[10px]

                    font-semibold

                    text-red-300
                  "
                >

                  <AlertCircle
                    size={14}
                    className="shrink-0"
                  />

                  {error}

                </motion.div>

              )}


            </div>


          </div>



          {/* ==================================================
              RIGHT SIDE
          ================================================== */}

          <div
            className="
              flex

              w-full

              flex-col

              gap-3

              sm:flex-row
              sm:items-center

              xl:w-auto
            "
          >


            {/* ================================================
                REPORT BATCH
            ================================================ */}

            <div
              className="
                min-w-[175px]

                rounded-[20px]

                border
                border-[#B7784B]/22

                bg-gradient-to-br
                from-[#28170F]
                to-[#1D100A]

                px-4
                py-3.5

                shadow-[0_10px_26px_rgba(0,0,0,0.14)]
              "
            >


              <div
                className="
                  flex
                  items-center
                  justify-between

                  gap-3
                "
              >

                <p
                  className="
                    text-[8px]

                    font-black

                    uppercase

                    tracking-[0.16em]

                    text-[#9E806B]
                  "
                >
                  REPORT FOR
                </p>


                <PackageCheck
                  size={13}
                  className="
                    text-[#C98B57]
                  "
                />

              </div>


              <div
                className="
                  mt-2

                  flex
                  items-center

                  gap-2
                "
              >

                <span
                  className="
                    h-2
                    w-2

                    shrink-0

                    rounded-full

                    bg-[#E8A568]

                    shadow-[0_0_8px_rgba(232,165,104,0.7)]
                  "
                />


                <span
                  className="
                    whitespace-nowrap

                    text-[14px]

                    font-black

                    tracking-[0.04em]

                    !text-[#FFE8D0]
                  "
                >
                  {batchId || "No Batch"}
                </span>


              </div>


            </div>



            {/* ================================================
                DOWNLOAD BUTTON
            ================================================ */}

            <motion.button

              whileHover={
                loading
                  ? {}
                  : {
                      y: -2,
                      scale: 1.02
                    }
              }

              whileTap={
                loading
                  ? {}
                  : {
                      scale: 0.97
                    }
              }

              disabled={loading}

              onClick={generatePDF}

              className={`
                group/button

                relative

                flex

                min-h-[58px]

                w-full
                sm:w-auto

                min-w-[220px]

                shrink-0

                items-center
                justify-center

                gap-2.5

                overflow-hidden

                rounded-[18px]

                border

                px-6

                text-[11px]

                font-black

                tracking-[0.025em]

                transition-all
                duration-300

                ${
                  loading
                    ? `
                      border-[#8C7564]/15

                      bg-[#291912]

                      !text-[#9D8878]

                      cursor-not-allowed
                    `
                    : success
                    ? `
                      border-emerald-400/25

                      bg-gradient-to-r
                      from-emerald-500/22
                      to-emerald-400/14

                      !text-emerald-200

                      shadow-[0_12px_30px_rgba(16,185,129,0.13)]
                    `
                    : `
                      border-[#E0A36B]/35

                      bg-gradient-to-r
                      from-[#EDB871]
                      via-[#DF9E5C]
                      to-[#C57A43]

                      !text-[#291308]

                      shadow-[0_14px_35px_rgba(184,107,48,0.25)]

                      hover:shadow-[0_18px_42px_rgba(184,107,48,0.32)]
                    `
                }
              `}
            >


              {!loading && !success && (

                <div
                  className="
                    pointer-events-none

                    absolute
                    inset-0

                    -translate-x-full

                    bg-gradient-to-r
                    from-transparent
                    via-white/20
                    to-transparent

                    transition-transform
                    duration-700

                    group-hover/button:translate-x-full
                  "
                />

              )}


              <div
                className="
                  relative
                  z-10

                  flex
                  items-center
                  justify-center

                  gap-2.5
                "
              >


                {loading ? (

                  <>

                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    <span>
                      Generating AI Report
                    </span>

                  </>

                ) : success ? (

                  <>

                    <CheckCircle size={17} />

                    <span>
                      Downloaded
                    </span>

                  </>

                ) : (

                  <>

                    <FileDown
                      size={17}
                      className="
                        transition-transform
                        duration-300

                        group-hover/button:translate-y-0.5
                      "
                    />

                    <span>
                      Download AI PDF
                    </span>

                  </>

                )}


              </div>


            </motion.button>


          </div>


        </div>



        {/* ======================================================
            MINIMAL FOOTER
        ====================================================== */}

        <div
          className="
            mt-6

            flex
            flex-col

            gap-2.5

            border-t
            border-[#A87552]/10

            pt-4

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >


          <div
            className="
              flex
              items-center

              gap-3
            "
          >


            <span
              className="
                flex
                items-center

                gap-1.5

                text-[8px]

                font-semibold

                uppercase

                tracking-[0.1em]

                text-[#806A59]
              "
            >

              <CheckCircle
                size={10}
                className="
                  text-emerald-400/75
                "
              />

              AI Quality Intelligence

            </span>


            <span
              className="
                h-1
                w-1

                rounded-full

                bg-[#755B49]
              "
            />


            <span
              className="
                flex
                items-center

                gap-1.5

                text-[8px]

                font-semibold

                uppercase

                tracking-[0.1em]

                text-[#806A59]
              "
            >

              <ShieldCheck
                size={10}
                className="
                  text-[#C68A57]
                "
              />

              Industrial Report

            </span>


          </div>


          <span
            className="
              flex
              items-center

              gap-1.5

              text-[8px]

              font-semibold

              uppercase

              tracking-[0.1em]

              text-[#806A59]
            "
          >

            <span
              className="
                h-1.5
                w-1.5

                rounded-full

                bg-emerald-400

                shadow-[0_0_7px_rgba(52,211,153,0.7)]
              "
            />

            PDF Export Ready

          </span>


        </div>


      </div>


    </motion.section>

  );

}



export default PDFReportButton;