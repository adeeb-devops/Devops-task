import { DeviceContext } from "../context/deviceContext";
import minus from "../../main-app/assets/minus.png"
import plus from "../../main-app/assets/plus.png"
import { ResponsiveFontSize } from "../utils/ResponsiveFontSize";
import { useContext } from "react";

export const PlusMinus = ({ heading, top, height, onPlusClick, onMinusClick, value,left, }) => {
    const { isMobile } = useContext(DeviceContext);

    return (
        <div style={{ ...styles[`${isMobile ? "p" : "l"}_mainContainer`], height: height ?? "9.702%", top: top,left:left&&left }}>

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
                <div style={{ ...styles[`${isMobile ? "p" : "l"}_imageContainer`], }} onClick={onMinusClick}>
                    <img src={minus} style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{
                    height: '100%', width: '50%', display: 'flex', justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <h2 style={{
                        color: '#fff',
                        fontSize: ResponsiveFontSize(isMobile, isMobile ? 14 : 16),
                        fontWeight: '700',
                    }}>
                        {value}
                    </h2>
                </div>
                <div style={{ ...styles[`${isMobile ? "p" : "l"}_imageContainer`], }} onClick={onPlusClick}>
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
    p_subContainer:{
        height: '63.65%', width: '100%', borderRadius: '4px',
        border: '1px solid #3C4057',
        background: '#1C1F32',
        boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.15)',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: '2%',
        paddingRight: '2%'
    },
    l_subContainer:{
        height: '51.65%', width: '100%', borderRadius: '4px',
        border: '1px solid #3C4057',
        background: '#1C1F32',
        boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.15)',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: '2%',
        paddingRight: '2%'
    },
    p_imageContainer:{
        height: '49%', width: '14%' 
    },
    l_imageContainer:{
        height: '49%', width: '6%' 
    }
}