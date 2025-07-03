import { DeviceContext } from "../context/deviceContext";

import { ResponsiveFontSize } from "../utils/ResponsiveFontSize";
import { useContext } from "react";
import infinity from "../../main-app/assets/infinity.png"


export const ProfitLossComp = ({ heading,height, top, isProfit, isInfinity,value ,onChange,isAutoBetActive,isBetPlaced}) => {
    const { isMobile } = useContext(DeviceContext);
    const shouldShowInfinityIcon = isInfinity && !value;
    return (
        <div style={{ height:height?? '9.702%', width: '91.62%', position: 'absolute', top: top, display: 'flex', justifyContent: 'space-between', flexDirection: 'column', }}>
            <h2 style={{
                color: '#fff',
                fontSize: ResponsiveFontSize(isMobile, isMobile ? 12 : 16),
                fontWeight: '700',
            }}>
                {heading}
            </h2>
            <div style={{
                height:isMobile?'63.6%': '51.65%', width: '100%', borderRadius: '4px',
                border: '1px solid #3C4057',
                background: '#1C1F32',
                boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.15)',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
                paddingLeft: '3%',
                paddingRight: '2%'
            }}>

                <input style={{
                    height: '100%', width: '60%', display: 'flex',
                    alignItems: 'center', color: '#fff',
                    fontSize: ResponsiveFontSize(isMobile, isMobile ? 14 : 16),
                    fontWeight: '700',
                }}  value={value} type="number" disabled={isAutoBetActive||isBetPlaced} onChange={onChange}
                >

                </input>
                {isProfit && <div style={{
                    height: '100%', width: '60%', display: 'flex',
                    alignItems: 'center', justifyContent: 'flex-end'
                }}>
                    <h2 style={{
                        color: '#fff',
                        fontSize: ResponsiveFontSize(isMobile, isMobile ? 14 : 16),
                        fontWeight: '700',
                        textAlign: 'right'
                    }}>
                        0.00
                    </h2>
                </div>}
                  {
                    shouldShowInfinityIcon && <div style={{ height: '49%', width: '6%', }}>
                        <img src={infinity} style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                    </div>
                  }

            </div>
        </div>
    )
}