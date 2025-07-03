import { DeviceContext } from "../context/deviceContext";
import minus from "../../main-app/assets/minus.png"
import plus from "../../main-app/assets/plus.png"
import { ResponsiveFontSize } from "../utils/ResponsiveFontSize";
import { useContext, useEffect, useState } from "react";

export const PlusMinusMines = ({ heading, top, height, onPlusClick, onMinusClick, left, onValueChanged, value, gridSize, isBetPlaced, isAutoBetActive, selectedTiles }) => {
    const { isMobile } = useContext(DeviceContext);
    const [number, setNumber] = useState(1);

    const handleBlur = () => {
        let numericValue = number;
        let min = 1
        let max = (gridSize * gridSize) - 1
        // If input is empty or NaN, reset to minimum
        // if (!numericValue || numericValue < min) {
        //   numericValue = min;
        // }
        if (isNaN(numericValue) || numericValue < min) {
            numericValue = min;
        }

        // If input exceeds maximum, reset to maximum
        if (numericValue > max) {

            numericValue = max;
        }
        if (isBetPlaced || isAutoBetActive || selectedTiles.length > 0) {
            return
        }
        setNumber(numericValue); // Set the corrected value
        if (onValueChanged) onValueChanged(numericValue);
    };
    const handleChange = (e) => {
        const inputValue = e.target.value;

        // Allow only numeric input
        if (!/^\d*$/.test(inputValue)) return;
        if (isBetPlaced || isAutoBetActive || selectedTiles.length > 0) {
            return
        }
        const numValue = inputValue === '' ? 0 : Number(inputValue);
        const maxMines = (gridSize * gridSize) - 1;
        
        // Check if the entered value exceeds max mines
        if (numValue > maxMines) {
          // Limit to maximum allowed value
          setNumber(maxMines);
          if (onValueChanged) onValueChanged(maxMines);
          return;
        }
        setNumber(inputValue);
        // onValueChange(inputValue);

    };


    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleBlur(); // Apply validation when pressing Enter
        }
    };

    const onMinus = () => {
        if (isBetPlaced || isAutoBetActive || selectedTiles.length > 0) {
            return
        }
        if (number >= 2) {
            onMinusClick(number - 1)
            setNumber(number - 1)
        }

    }

    const onPlus = () => {
        if (isBetPlaced || isAutoBetActive || selectedTiles.length > 0) {
            return
        }
        const currentNumber = Number(number);
        const maxMines = (gridSize * gridSize) - 1;

        // if(number<(gridSize*gridSize)-1){
        //     onMinusClick(number+1)
        //     setNumber(number+1)
        // }
        if (currentNumber < maxMines) {
            const newValue = currentNumber + 1;
            onPlusClick(newValue); // Call the correct function with the new value
            setNumber(newValue);
        }

    }

    useEffect(() => {
        setNumber(value)
    }, [value])

    return (
        <div style={{ ...styles[`${isMobile ? "p" : "l"}_mainContainer`], height: height ?? "9.702%", top: top, left: left && left }}>

            <h2 style={{
                color: '#fff',
                fontSize: ResponsiveFontSize(isMobile, isMobile ? 12 : 16),
                fontWeight: '700',
            }}>
                {heading}
            </h2>
            <div style={{
                ...styles[`${isMobile ? "p" : "l"}_subContainer`],
            }}>
                <div style={{ ...styles[`${isMobile ? "p" : "l"}_imageContainer`], }} onClick={onMinus}>
                    <img src={minus} style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{
                    height: '100%', width: '50%', display: 'flex', justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <input
                        style={{
                            height: '100%', width: '100%', display: 'flex', justifyContent: 'center',
                            alignItems: 'center',
                            background: '#1C1F32', color: '#fff', fontWeight: '700', border: '1px solid #fff',
                            fontSize: ResponsiveFontSize(isMobile, isMobile ? 14 : 16),
                            textAlign: 'center'


                        }}
                        value={number}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown} min={1} />

                </div>
                <div style={{ ...styles[`${isMobile ? "p" : "l"}_imageContainer`], }} onClick={onPlus}>
                    <img src={plus} style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                </div>
            </div>
        </div>
    )
}


const styles: any = {
    p_mainContainer: {
        width: '41.4%', position: 'absolute', display: 'flex', justifyContent: 'space-between', flexDirection: 'column',
    },
    l_mainContainer: {
        width: '91.62%', position: 'absolute', display: 'flex', justifyContent: 'space-between', flexDirection: 'column',
    },
    p_subContainer: {
        height: '63.65%', width: '100%', borderRadius: '4px',
        border: '1px solid #3C4057',
        background: '#1C1F32',
        boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.15)',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: '2%',
        paddingRight: '2%'
    },
    l_subContainer: {
        height: '51.65%', width: '100%', borderRadius: '4px',
        border: '1px solid #3C4057',
        background: '#1C1F32',
        boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.15)',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: '2%',
        paddingRight: '2%'
    },
    p_imageContainer: {
        height: '49%', width: '14%'
    },
    l_imageContainer: {
        height: '49%', width: '6%'
    }
}