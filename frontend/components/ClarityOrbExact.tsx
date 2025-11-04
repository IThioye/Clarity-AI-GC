import React from 'react'

export default function ClarityOrbExact(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 800 800"
      role="img"
      aria-label="Clarity AI orb logo"
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <filter id="HaloBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="40" />
        </filter>
        <filter id="SoftBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
        <filter id="InnerShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          <feOffset dy="2" result="off" />
          <feComposite in="off" in2="blur" operator="arithmetic" k2="-1" k3="1" result="innerShadow" />
          <feColorMatrix in="innerShadow" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0`} />
          <feComposite in="SourceGraphic" operator="over" />
        </filter>
        <radialGradient id="HaloBlueViolet" cx="30%" cy="35%" r="70%" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8FC8FF" />
          <stop offset="55%" stopColor="#C58AFF" />
          <stop offset="100%" stopColor="rgba(197,138,255,0)" />
        </radialGradient>
        <radialGradient id="HaloVioletRose" cx="70%" cy="70%" r="75%" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C58AFF" />
          <stop offset="55%" stopColor="#F9A9D3" />
          <stop offset="100%" stopColor="rgba(249,169,211,0)" />
        </radialGradient>
        <radialGradient id="Specular" cx="36%" cy="18%" r="30%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <linearGradient id="WarmRim" x1="62%" y1="30%" x2="92%" y2="60%">
          <stop offset="0%" stopColor="rgba(255,214,181,0.85)" />
          <stop offset="70%" stopColor="rgba(255,214,181,0.15)" />
          <stop offset="100%" stopColor="rgba(255,214,181,0)" />
        </linearGradient>
        <linearGradient id="TopLobe" x1="20%" y1="20%" x2="90%" y2="90%" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EAF3FF" />
          <stop offset="45%" stopColor="#BFD8FF" />
          <stop offset="100%" stopColor="#A7C9FF" />
        </linearGradient>
        <linearGradient id="BottomLobe" x1="85%" y1="85%" x2="15%" y2="15%" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F9A9D3" />
          <stop offset="60%" stopColor="#C58AFF" />
          <stop offset="100%" stopColor="#8FC8FF" />
        </linearGradient>
        <clipPath id="InnerClip">
          <circle cx="400" cy="420" r="270" />
        </clipPath>
      </defs>

      <g id="Halo" filter="url(#HaloBlur)">
        <circle cx="400" cy="420" r="300" fill="url(#HaloBlueViolet)" opacity="0.22" />
        <circle cx="470" cy="430" r="300" fill="url(#HaloVioletRose)" opacity="0.18" />
      </g>
      <g id="RimOuter">
        <circle cx="400" cy="420" r="270" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.65)" strokeWidth={6} filter="url(#InnerShadow)" />
      </g>
      <g id="RimWarm">
        <path d="M 640 420 A 240 240 0 0 0 560 220" stroke="url(#WarmRim)" strokeWidth={22} fill="none" opacity="0.7" />
      </g>
      <g id="Inner" clipPath="url(#InnerClip)">
        <rect x="130" y="150" width="540" height="540" fill="rgba(8,10,24,0.55)" />
        <g id="LobeTop">
          <path d="M 140 390 C 235 300, 335 265, 405 292 C 480 322, 540 365, 655 360 L 655 140 L 140 140 Z" fill="url(#TopLobe)" opacity="0.95" />
        </g>
        <g id="LobeBottom">
          <path d="M 140 450 C 280 456, 360 428, 420 386 C 505 332, 575 332, 655 352 L 655 700 L 140 700 Z" fill="url(#BottomLobe)" opacity="0.95" />
        </g>
        <g id="SCurveHighlight">
          <path d="M 140 438 C 280 444, 360 416, 420 376 C 510 318, 575 323, 655 343" stroke="rgba(255,255,255,0.28)" strokeWidth={6} fill="none" filter="url(#SoftBlur)" />
        </g>
        <g id="Sheen">
          <ellipse cx="380" cy="610" rx="190" ry="110" fill="rgba(255,255,255,0.06)" filter="url(#SoftBlur)" />
        </g>
        <g id="SpecularTop">
          <circle cx="330" cy="255" r="90" fill="url(#Specular)" />
        </g>
      </g>
      <g id="InnerRim">
        <circle cx="400" cy="420" r="258" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={3} />
      </g>
    </svg>
  )
}
