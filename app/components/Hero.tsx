"use client";

import { useRouter } from "next/navigation";
import { type SectionDrawerSection, useSectionDrawerStore } from "@/store/useSectionDrawerStore";

const heroSvg = `
            <g clip-path="url(#clip0_69_186)">
              <path
                d="M1272 270H0V0H1272V270ZM34 32V193H1242V32H34Z"
                fill="#09090B"
              ></path>
              <g filter="url(#filter0_d_69_186)">
                <path
                  d="M1225.77 198.511L1209.23 227.011C1208.16 228.861 1206.18 230 1204.04 230H939.418C934.794 230 931.908 224.989 934.229 220.989L950.766 192.489C951.839 190.639 953.816 189.5 955.955 189.5H1220.58C1225.21 189.5 1228.09 194.511 1225.77 198.511Z"
                  fill="#27272C"
                ></path>
                <path
                  d="M1225.77 198.511L1209.23 227.011C1208.16 228.861 1206.18 230 1204.04 230H939.418C934.794 230 931.908 224.989 934.229 220.989L950.766 192.489C951.839 190.639 953.816 189.5 955.955 189.5H1220.58C1225.21 189.5 1228.09 194.511 1225.77 198.511Z"
                  stroke="#32323A"
                ></path>
              </g>
              <g filter="url(#filter1_d_69_186)">
                <path
                  d="M337.082 230H230.5H69.4926C67.3338 230 65.3414 228.84 64.2753 226.963L48.0901 198.463C45.8186 194.463 48.7076 189.5 53.3074 189.5H320.545C322.684 189.5 324.661 190.639 325.734 192.489L342.271 220.989C344.592 224.989 341.706 230 337.082 230Z"
                  fill="#27272C"
                ></path>
                <path
                  d="M337.082 230H230.5H69.4926C67.3338 230 65.3414 228.84 64.2753 226.963L48.0901 198.463C45.8186 194.463 48.7076 189.5 53.3074 189.5H320.545C322.684 189.5 324.661 190.639 325.734 192.489L342.271 220.989C344.592 224.989 341.706 230 337.082 230Z"
                  stroke="#32323A"
                ></path>
              </g>
              <g filter="url(#filter2_d_69_186)">
                <path
                  d="M1247.5 22C1250.81 22 1253.5 24.6863 1253.5 28V197C1253.5 200.314 1250.81 203 1247.5 203H959.013C956.843 203 954.843 204.171 953.781 206.064L929.719 248.936C928.657 250.829 926.657 252 924.487 252H353.503C351.339 252 349.342 250.834 348.278 248.949L323.222 204.551C322.158 202.666 320.161 201.5 317.997 201.5H23.5C20.1863 201.5 17.5 198.814 17.5 195.5V28C17.5 24.6863 20.1863 22 23.5 22H1247.5ZM54 46C50.6863 46 48 48.6863 48 52V168C48 171.314 50.6863 174 54 174H1218C1221.31 174 1224 171.314 1224 168V52C1224 48.6863 1221.31 46 1218 46H54Z"
                  fill="#18181B"
                ></path>
                <path
                  d="M323.222 204.551L322.786 204.797L323.222 204.551ZM348.278 248.949L348.714 248.703L348.278 248.949ZM929.719 248.936L929.283 248.692L929.719 248.936ZM953.781 206.064L954.217 206.308L953.781 206.064ZM1253.5 28H1253V197H1253.5H1254V28H1253.5ZM1247.5 203V202.5H959.013V203V203.5H1247.5V203ZM953.781 206.064L953.345 205.819L929.283 248.692L929.719 248.936L930.155 249.181L954.217 206.308L953.781 206.064ZM924.487 252V251.5H353.503V252V252.5H924.487V252ZM348.278 248.949L348.714 248.703L323.657 204.305L323.222 204.551L322.786 204.797L347.843 249.195L348.278 248.949ZM317.997 201.5V201H23.5V201.5V202H317.997V201.5ZM17.5 195.5H18V28H17.5H17V195.5H17.5ZM23.5 22V22.5H1247.5V22V21.5H23.5V22ZM48 52H47.5V168H48H48.5V52H48ZM54 174V174.5H1218V174V173.5H54V174ZM1224 168H1224.5V52H1224H1223.5V168H1224ZM1218 46V45.5H54V46V46.5H1218V46ZM1224 52H1224.5C1224.5 48.4101 1221.59 45.5 1218 45.5V46V46.5C1221.04 46.5 1223.5 48.9624 1223.5 52H1224ZM1218 174V174.5C1221.59 174.5 1224.5 171.59 1224.5 168H1224H1223.5C1223.5 171.038 1221.04 173.5 1218 173.5V174ZM48 168H47.5C47.5 171.59 50.4101 174.5 54 174.5V174V173.5C50.9624 173.5 48.5 171.038 48.5 168H48ZM48 52H48.5C48.5 48.9624 50.9624 46.5 54 46.5V46V45.5C50.4101 45.5 47.5 48.4101 47.5 52H48ZM17.5 28H18C18 24.9624 20.4624 22.5 23.5 22.5V22V21.5C19.9101 21.5 17 24.4101 17 28H17.5ZM23.5 201.5V201C20.4624 201 18 198.538 18 195.5H17.5H17C17 199.09 19.9101 202 23.5 202V201.5ZM323.222 204.551L323.657 204.305C322.505 202.263 320.342 201 317.997 201V201.5V202C319.981 202 321.811 203.069 322.786 204.797L323.222 204.551ZM353.503 252V251.5C351.519 251.5 349.689 250.431 348.714 248.703L348.278 248.949L347.843 249.195C348.995 251.237 351.158 252.5 353.503 252.5V252ZM929.719 248.936L929.283 248.692C928.31 250.426 926.476 251.5 924.487 251.5V252V252.5C926.838 252.5 929.005 251.231 930.155 249.181L929.719 248.936ZM959.013 203V202.5C956.662 202.5 954.495 203.769 953.345 205.819L953.781 206.064L954.217 206.308C955.19 204.574 957.024 203.5 959.013 203.5V203ZM1253.5 197H1253C1253 200.038 1250.54 202.5 1247.5 202.5V203V203.5C1251.09 203.5 1254 200.59 1254 197H1253.5ZM1253.5 28H1254C1254 24.4101 1251.09 21.5 1247.5 21.5V22V22.5C1250.54 22.5 1253 24.9624 1253 28H1253.5Z"
                  fill="#232327"
                ></path>
              </g>
              <path
                d="M952.266 226H962.42C962.779 226 963.11 225.808 963.288 225.496L972.145 209.996C972.526 209.329 972.045 208.5 971.277 208.5H961.566C961.215 208.5 960.889 208.684 960.709 208.986L951.409 224.486C951.009 225.152 951.489 226 952.266 226Z"
                class="matrix-bar hero-bar hero-bar-right"
              ></path>
              <path
                d="M972.266 226H982.42C982.779 226 983.11 225.808 983.288 225.496L992.145 209.996C992.526 209.329 992.045 208.5 991.277 208.5H981.566C981.215 208.5 980.889 208.684 980.709 208.986L971.409 224.486C971.009 225.152 971.489 226 972.266 226Z"
                class="matrix-bar hero-bar hero-bar-right"
              ></path>
              <path
                d="M992.266 226H1002.42C1002.78 226 1003.11 225.808 1003.29 225.496L1012.15 209.996C1012.53 209.329 1012.04 208.5 1011.28 208.5H1001.57C1001.21 208.5 1000.89 208.684 1000.71 208.986L991.409 224.486C991.009 225.152 991.489 226 992.266 226Z"
                class="matrix-bar hero-bar hero-bar-right"
              ></path>
              <path
                d="M1012.27 226H1022.42C1022.78 226 1023.11 225.808 1023.29 225.496L1032.15 209.996C1032.53 209.329 1032.04 208.5 1031.28 208.5H1021.57C1021.21 208.5 1020.89 208.684 1020.71 208.986L1011.41 224.486C1011.01 225.152 1011.49 226 1012.27 226Z"
                class="matrix-bar hero-bar hero-bar-right"
              ></path>
              <path
                d="M1032.27 226H1042.42C1042.78 226 1043.11 225.808 1043.29 225.496L1052.15 209.996C1052.53 209.329 1052.04 208.5 1051.28 208.5H1041.57C1041.21 208.5 1040.89 208.684 1040.71 208.986L1031.41 224.486C1031.01 225.152 1031.49 226 1032.27 226Z"
                class="matrix-bar hero-bar hero-bar-right"
              ></path>
              <path
                d="M1052.27 226H1062.42C1062.78 226 1063.11 225.808 1063.29 225.496L1072.15 209.996C1072.53 209.329 1072.04 208.5 1071.28 208.5H1061.57C1061.21 208.5 1060.89 208.684 1060.71 208.986L1051.41 224.486C1051.01 225.152 1051.49 226 1052.27 226Z"
                class="matrix-bar hero-bar hero-bar-right"
              ></path>
              <path
                d="M1072.27 226H1082.42C1082.78 226 1083.11 225.808 1083.29 225.496L1092.15 209.996C1092.53 209.329 1092.04 208.5 1091.28 208.5H1081.57C1081.21 208.5 1080.89 208.684 1080.71 208.986L1071.41 224.486C1071.01 225.152 1071.49 226 1072.27 226Z"
                class="matrix-bar hero-bar hero-bar-right"
              ></path>
              <path
                d="M1092.27 226H1102.42C1102.78 226 1103.11 225.808 1103.29 225.496L1112.15 209.996C1112.53 209.329 1112.04 208.5 1111.28 208.5H1101.57C1101.21 208.5 1100.89 208.684 1100.71 208.986L1091.41 224.486C1091.01 225.152 1091.49 226 1092.27 226Z"
                class="matrix-bar hero-bar hero-bar-right"
              ></path>
              <path
                d="M1112.27 226H1122.42C1122.78 226 1123.11 225.808 1123.29 225.496L1132.15 209.996C1132.53 209.329 1132.04 208.5 1131.28 208.5H1121.57C1121.21 208.5 1120.89 208.684 1120.71 208.986L1111.41 224.486C1111.01 225.152 1111.49 226 1112.27 226Z"
                class="matrix-bar hero-bar hero-bar-right"
              ></path>
              <path
                d="M1132.27 226H1142.42C1142.78 226 1143.11 225.808 1143.29 225.496L1152.15 209.996C1152.53 209.329 1152.04 208.5 1151.28 208.5H1141.57C1141.21 208.5 1140.89 208.684 1140.71 208.986L1131.41 224.486C1131.01 225.152 1131.49 226 1132.27 226Z"
                class="matrix-bar hero-bar hero-bar-right"
              ></path>
              <path
                d="M1152.27 226H1162.42C1162.78 226 1163.11 225.808 1163.29 225.496L1172.15 209.996C1172.53 209.329 1172.04 208.5 1171.28 208.5H1161.57C1161.21 208.5 1160.89 208.684 1160.71 208.986L1151.41 224.486C1151.01 225.152 1151.49 226 1152.27 226Z"
                class="matrix-bar hero-bar hero-bar-right"
              ></path>
              <path
                d="M1172.27 226H1182.42C1182.78 226 1183.11 225.808 1183.29 225.496L1192.15 209.996C1192.53 209.329 1192.04 208.5 1191.28 208.5H1181.57C1181.21 208.5 1180.89 208.684 1180.71 208.986L1171.41 224.486C1171.01 225.152 1171.49 226 1172.27 226Z"
                class="matrix-bar hero-bar hero-bar-right"
              ></path>
              <path
                d="M1192.27 226H1202.42C1202.78 226 1203.11 225.808 1203.29 225.496L1212.15 209.996C1212.53 209.329 1212.04 208.5 1211.28 208.5H1201.57C1201.21 208.5 1200.89 208.684 1200.71 208.986L1191.41 224.486C1191.01 225.152 1191.49 226 1192.27 226Z"
                class="matrix-bar hero-bar hero-bar-right"
              ></path>
              <path
                d="M324.734 225.5H314.58C314.221 225.5 313.89 225.308 313.712 224.996L304.855 209.496C304.474 208.829 304.955 208 305.723 208H315.434C315.785 208 316.111 208.184 316.291 208.486L325.591 223.986C325.991 224.652 325.511 225.5 324.734 225.5Z"
                class="matrix-bar hero-bar hero-bar-left"
              ></path>
              <path
                d="M304.734 225.5H294.58C294.221 225.5 293.89 225.308 293.712 224.996L284.855 209.496C284.474 208.829 284.955 208 285.723 208H295.434C295.785 208 296.111 208.184 296.291 208.486L305.591 223.986C305.991 224.652 305.511 225.5 304.734 225.5Z"
                class="matrix-bar hero-bar hero-bar-left"
              ></path>
              <path
                d="M284.734 225.5H274.58C274.221 225.5 273.89 225.308 273.712 224.996L264.855 209.496C264.474 208.829 264.955 208 265.723 208H275.434C275.785 208 276.111 208.184 276.291 208.486L285.591 223.986C285.991 224.652 285.511 225.5 284.734 225.5Z"
                class="matrix-bar hero-bar hero-bar-left"
              ></path>
              <path
                d="M264.734 225.5H254.58C254.221 225.5 253.89 225.308 253.712 224.996L244.855 209.496C244.474 208.829 244.955 208 245.723 208H255.434C255.785 208 256.111 208.184 256.291 208.486L265.591 223.986C265.991 224.652 265.511 225.5 264.734 225.5Z"
                class="matrix-bar hero-bar hero-bar-left"
              ></path>
              <path
                d="M244.734 225.5H234.58C234.221 225.5 233.89 225.308 233.712 224.996L224.855 209.496C224.474 208.829 224.955 208 225.723 208H235.434C235.785 208 236.111 208.184 236.291 208.486L245.591 223.986C245.991 224.652 245.511 225.5 244.734 225.5Z"
                class="matrix-bar hero-bar hero-bar-left"
              ></path>
              <path
                d="M224.734 225.5H214.58C214.221 225.5 213.89 225.308 213.712 224.996L204.855 209.496C204.474 208.829 204.955 208 205.723 208H215.434C215.785 208 216.111 208.184 216.291 208.486L225.591 223.986C225.991 224.652 225.511 225.5 224.734 225.5Z"
                class="matrix-bar hero-bar hero-bar-left"
              ></path>
              <path
                d="M204.734 225.5H194.58C194.221 225.5 193.89 225.308 193.712 224.996L184.855 209.496C184.474 208.829 184.955 208 185.723 208H195.434C195.785 208 196.111 208.184 196.291 208.486L205.591 223.986C205.991 224.652 205.511 225.5 204.734 225.5Z"
                class="matrix-bar hero-bar hero-bar-left"
              ></path>
              <path
                d="M184.734 225.5H174.58C174.221 225.5 173.89 225.308 173.712 224.996L164.855 209.496C164.474 208.829 164.955 208 165.723 208H175.434C175.785 208 176.111 208.184 176.291 208.486L185.591 223.986C185.991 224.652 185.511 225.5 184.734 225.5Z"
                class="matrix-bar hero-bar hero-bar-left"
              ></path>
              <path
                d="M164.734 225.5H154.58C154.221 225.5 153.89 225.308 153.712 224.996L144.855 209.496C144.474 208.829 144.955 208 145.723 208H155.434C155.785 208 156.111 208.184 156.291 208.486L165.591 223.986C165.991 224.652 165.511 225.5 164.734 225.5Z"
                class="matrix-bar hero-bar hero-bar-left"
              ></path>
              <path
                d="M144.734 225.5H134.58C134.221 225.5 133.89 225.308 133.712 224.996L124.855 209.496C124.474 208.829 124.955 208 125.723 208H135.434C135.785 208 136.111 208.184 136.291 208.486L145.591 223.986C145.991 224.652 145.511 225.5 144.734 225.5Z"
                class="matrix-bar hero-bar hero-bar-left"
              ></path>
              <path
                d="M124.734 225.5H114.58C114.221 225.5 113.89 225.308 113.712 224.996L104.855 209.496C104.474 208.829 104.955 208 105.723 208H115.434C115.785 208 116.111 208.184 116.291 208.486L125.591 223.986C125.991 224.652 125.511 225.5 124.734 225.5Z"
                class="matrix-bar hero-bar hero-bar-left"
              ></path>
              <path
                d="M104.734 225.5H94.5803C94.2215 225.5 93.8901 225.308 93.7121 224.996L84.8549 209.496C84.474 208.829 84.9554 208 85.7232 208H95.4338C95.7851 208 96.1106 208.184 96.2913 208.486L105.591 223.986C105.991 224.652 105.511 225.5 104.734 225.5Z"
                class="matrix-bar hero-bar hero-bar-left"
              ></path>
              <path
                d="M84.7338 225.5H74.5803C74.2215 225.5 73.8901 225.308 73.7121 224.996L64.8549 209.496C64.474 208.829 64.9554 208 65.7232 208H75.4338C75.7851 208 76.1106 208.184 76.2913 208.486L85.5913 223.986C85.9912 224.652 85.5111 225.5 84.7338 225.5Z"
                class="matrix-bar hero-bar hero-bar-left"
              ></path>
              <path
                d="M943.756 201.5H672H336.189C335.429 201.5 334.947 202.315 335.313 202.981L356.715 241.981C356.891 242.301 357.227 242.5 357.592 242.5H920.927C921.282 242.5 921.61 242.312 921.79 242.005L944.619 203.005C945.009 202.339 944.528 201.5 943.756 201.5Z"
                fill="#25252B"
                stroke="#2C2C32"
                class="hero-title-plate"
              ></path>
              <text
                x="636"
                y="230"
                text-anchor="middle"
                fill="#67676E"
                font-family="Space Grotesk"
                font-size="24"
                font-weight="700"
                letter-spacing="0.18em"
                class="hero-title"
              >
                AREFEVPRO
              </text>
              <rect class="matrix-bar" x="597" y="33" width="77" height="2" rx="1"></rect>
              <circle
                cx="636"
                cy="34"
                r="9"
                fill="#18181B"
                stroke="#515158"
                stroke-width="2"
                class="scan-center scan-center-outer"
              ></circle>
              <circle
                cx="636"
                cy="34"
                r="5"
                fill="#515158"
                class="scan-center scan-center-inner"
              ></circle>
              <path
                class="matrix-line hero-line hero-line-right"
                d="M1237.5 122V40C1237.5 36.6863 1234.81 34 1231.5 34H764.5"
              ></path>
              <path
                class="matrix-line hero-line hero-line-left"
                d="M34 122V40C34 36.6863 36.6863 34 40 34H507"
              ></path>
              <circle
                class="matrix-dot start hero-dot hero-dot-bottom"
                cx="1237.5"
                cy="126.5"
                r="4.5"
              ></circle>
              <circle
                class="matrix-dot end hero-dot hero-dot-side"
                cx="764.5"
                cy="33.5"
                r="4.5"
              ></circle>
              <circle
                class="matrix-dot end hero-dot hero-dot-side"
                cx="506.5"
                cy="33.5"
                r="4.5"
              ></circle>
              <circle
                class="matrix-dot start hero-dot hero-dot-bottom"
                cx="33.5"
                cy="122.5"
                r="4.5"
              ></circle>
            </g>
            <defs>
              <filter
                id="filter0_d_69_186"
                x="932.909"
                y="189"
                width="302.183"
                height="49.5"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                ></feColorMatrix>
                <feOffset dx="4" dy="4"></feOffset>
                <feGaussianBlur stdDeviation="2"></feGaussianBlur>
                <feComposite in2="hardAlpha" operator="out"></feComposite>
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                ></feColorMatrix>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_69_186"></feBlend>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_69_186" result="shape"></feBlend>
              </filter>
              <filter
                id="filter1_d_69_186"
                x="46.7979"
                y="189"
                width="304.793"
                height="49.5"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                ></feColorMatrix>
                <feOffset dx="4" dy="4"></feOffset>
                <feGaussianBlur stdDeviation="2"></feGaussianBlur>
                <feComposite in2="hardAlpha" operator="out"></feComposite>
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                ></feColorMatrix>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_69_186"></feBlend>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_69_186" result="shape"></feBlend>
              </filter>
              <filter
                id="filter2_d_69_186"
                x="17"
                y="21.5"
                width="1248.5"
                height="242.5"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                ></feColorMatrix>
                <feOffset dx="7" dy="7"></feOffset>
                <feGaussianBlur stdDeviation="2.25"></feGaussianBlur>
                <feComposite in2="hardAlpha" operator="out"></feComposite>
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                ></feColorMatrix>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_69_186"></feBlend>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_69_186" result="shape"></feBlend>
              </filter>
              <clipPath id="clip0_69_186">
                <rect width="1272" height="270" fill="white"></rect>
              </clipPath>
            </defs>
`;

export default function Hero() {
  const router = useRouter();
  const toggleDrawer = useSectionDrawerStore((s) => s.toggle);
  const closeDrawer = useSectionDrawerStore((s) => s.close);

  const handleNav = (href: string, drawerSection: SectionDrawerSection) => {
    toggleDrawer(drawerSection);
    router.push(href);
  };

  const handleAuth = (href: string) => {
    closeDrawer();
    router.push(href);
  };

  return (
    <section className="hero" aria-label="AREFEVPRO banner">
      <div className="frame frame-hero">
        <div className="screen" id="item_0" aria-hidden="true"></div>
        <div className="hero-ui" aria-hidden="false">
          <div className="hero-auth" aria-label="Authentication">
            <button
              type="button"
              className="hero-auth-btn is-primary"
              onClick={() => handleAuth("/register")}
            >
              Регистрация
            </button>
            <button
              type="button"
              className="hero-auth-btn"
              onClick={() => handleAuth("/login")}
            >
              Войти
            </button>
          </div>
          <nav className="hero-nav" aria-label="Hero navigation">
            <button
              type="button"
              className="hero-nav-btn"
              onClick={() => handleNav("/blog", "blog")}
            >
              БЛОГ
            </button>
            <button
              type="button"
              className="hero-nav-btn"
              onClick={() => handleNav("/video", "video")}
            >
              ВИДЕО
            </button>
            <button
              type="button"
              className="hero-nav-btn"
              onClick={() => handleNav("/photo", "photo")}
            >
              ФОТО
            </button>
            <button
              type="button"
              className="hero-nav-btn"
              onClick={() => handleNav("/music", "music")}
            >
              МУЗЫКА
            </button>
            <button
              type="button"
              className="hero-nav-btn"
              onClick={() => handleNav("/projects", "projects")}
            >
              ПРОЕКТЫ
            </button>
          </nav>
        </div>
        <svg
          className="frame-svg"
          viewBox="0 0 1272 270"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: heroSvg }}
        />
      </div>
    </section>
  );
}
