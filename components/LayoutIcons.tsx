'use client'
import React from 'react'
import { FaArrowUp, FaXmark, FaEnvelope, FaPhone } from 'react-icons/fa6'

export function ScrollToTopIcon(): React.ReactElement {
    return <FaArrowUp aria-hidden />
}

export function MobileNavCloseIcon(): React.ReactElement {
    return <FaXmark aria-hidden />
}

export function EnvelopeIcon(): React.ReactElement {
    return <FaEnvelope aria-hidden />
}

export function PhoneIcon(): React.ReactElement {
    return <FaPhone aria-hidden />
}
