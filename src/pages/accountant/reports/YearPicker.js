import React, { useState, useRef, useEffect } from "react";

const YearPicker = ({ selectedYear, onSelect }) => {
    const years = Array.from({ length: 25 }, (_, i) => selectedYear - 12 + i);
    const containerRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const el = containerRef.current;
        const selectedIndex = years.findIndex(y => y === selectedYear);
        if (el && selectedIndex >= 0) {
            const itemHeight = el.firstChild?.offsetHeight || 40;
            el.scrollTo({ top: itemHeight * selectedIndex, behavior: "auto" });
        }
    }, [selectedYear]);

    const handleScroll = () => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            const el = containerRef.current;
            const itemHeight = el.firstChild?.offsetHeight || 40;
            const index = Math.round(el.scrollTop / itemHeight);
            const selected = years[index];
            if (selected !== selectedYear) {
                onSelect(selected);
            }
        }, 150); // 150ms scrolldan keyin aniqlik kiritiladi
    };

    return (
        <div
            className="year-wheel-container"
            ref={containerRef}
            onScroll={handleScroll}
        >
            {years.map((year) => (
                <div
                    key={year}
                    className={`year-item ${year === selectedYear ? "selected" : ""}`}
                    onClick={() => onSelect(year)}
                >
                    {year}
                </div>
            ))}
        </div>
    );
};

export default YearPicker;
