import React, { useState, useContext, useEffect } from "react";
import backBtn from "../assets/header/backBtn.svg";
import plusIcon from "../assets/header/plusIcon.svg";
import hamburgarg from "../assets/header/hamburger.png";
import {  useNavigate } from "react-router-dom";
import { DeviceContext } from '../context/deviceContext';
import ApiClient from "../api";
import { ResponsiveFontSize } from "../utils/ResponsiveFontSize";
import eventEmitter from "../eventEmitter";
import {clearSocket,disconnectSocket} from "../dataService"

export function Header({ title, isGame,onMenuClick }) {
  const { isMobile } = useContext(DeviceContext);
  const [userBalance,setUserBalance]=useState(0)
  const [gameId,setGameId]=useState('xxxxxxxx')
  const navigate = useNavigate();
  const [heading,setHeading]=useState('')
  const [name,setName]=useState('')
  const handleBackClick = () => {
    
    if(heading!==""){
       eventEmitter.emit('closeMenu')
       setHeading('')
    }
    else {
      clearSocket()
    disconnectSocket()
      console.log("title is undefined")
      navigate('/home')
        }
  };

  // Styles
  const styles = {
    p_headerContainer: {
      height: '4%',
      width: '95.2%',
      position: 'absolute',
      top: "1%",
      left: '1.2%',
    },
    l_headerContainer: {
      height: '5.6%',
      width: '97.2%',
      position: 'absolute',
      top: "2%",
      left: '1.2%',
    },
    p_backContainer: {
      height: '100%',
      width: '50%',
      display: 'flex',
      alignItems: 'center',
    },
    l_backContainer: {
      height: '100%',
      width: '40%',
      display: 'flex',
      alignItems: 'center',
    },
    p_backButton: {
      height: "50%",
      width: '6.5%',
      
    },
    l_backButton: {
      height: "57%",
      width: '3.5%',
    },
    p_title: {
      color: '#fff',
      fontSize: ResponsiveFontSize(isMobile, isMobile ?heading!==""? 14:8 : 12),
      fontWeight: '700',
      marginLeft: '4%',
    },
    l_title: {
      color: '#fff',
      fontSize: ResponsiveFontSize(isMobile, isMobile ? 8 : 16),
      fontWeight: '700',
      lineHeight: 22,
      marginLeft: '4%',
    },
    p_menuContainer: {
      height: '86%',
      width: '8%',
      position: 'absolute',
      right: '-0.5%',
      top: '7%',
    },
    l_menuContainer: {
      height: '100%',
      width: '3.25%',
      position: 'absolute',
      right: '0.5%',
      top: '0%',
    },
    p_balanceContainer: {
      height: '80%',
      width: '30.25%',
      position: 'absolute',
      right: '10%',
      top: '10%',
      borderRadius: '9px',
      border: '1px solid #282840',
      backgroundColor: '#141A2A',
      display: 'flex',
      alignItems: 'center',
    },
    l_balanceContainer: {
      height: '76%',
      width: '10.25%',
      position: 'absolute',
      right: '6%',
      top: '12%',
      borderRadius: '9px',
      border: '1px solid #282840',
      backgroundColor: '#141A2A',
      display: 'flex',
      alignItems: 'center',
    },
    p_balanceText: {
      color: '#fff',
      fontSize: ResponsiveFontSize(isMobile, isMobile ? 8 : 16),
      fontWeight: '600',
      marginLeft: '8%',
    },
    l_balanceText: {
      color: '#fff',
      fontSize: ResponsiveFontSize(isMobile, isMobile ? 8 : 16),
      fontWeight: '600',
      marginLeft: '8%',
    },
    p_plusIcon: {
      position: 'absolute',
      right: '5%',
      top: '15%',
      objectFit:'contain',height:'70%',width:'20%'
      
    },
    l_plusIcon: {
      position: 'absolute',
      right: '5%',
      top: '21%',
      objectFit:'contain',height:'60%',width:'20%'
    }
  };

  const getBalance=async ()=>{
    const token = localStorage.getItem("minesToken");
    if (token) {
      try {
        const response = await ApiClient.get(
          "/player/getBalance",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('knknkkcascx',response)
        if (response.data.success) {
          setUserBalance(Number(response.data.data.balance))
        }
      } catch (error) {
        console.error("Error during login verification:", error);
      }
    }
  }

  const messageFromWallet=()=>{
    const message = { key: 'wallet', data: 'Your data here' };
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage("wallet");
    } else {
      console.warn("window.ReactNativeWebView is not available.");
    }
    window.parent.postMessage(message, '*');
  }

  useEffect(()=>{
    console.log('sldjhwoehcowehwohe')
    getBalance()
    const userData = localStorage.getItem("user");
    const userParsed = userData ? JSON.parse(userData) : null;
    // setUserBalance(userParsed.balance)
    setName(userParsed.player_name!==null?userParsed.player_name:userParsed.username)
    eventEmitter.on('update-balance',(data)=>{
      console.log('nvkwenvwvewffe',data)
      setUserBalance(data)
    })
   eventEmitter.on("update-id",(data)=>{
    setGameId(data)
   })
   eventEmitter.on('change-title',(data)=>{
    setHeading(data)
   })
  },[])

  return (
    <div style={styles[`${isMobile ? "p" : "l"}_headerContainer`]}>
      <div style={styles[`${isMobile ? "p" : "l"}_backContainer`]}>
        <img
          src={backBtn}
          alt="backBtn"
          onClick={handleBackClick}
          style={styles[`${isMobile ? "p" : "l"}_backButton`]}
        />
        <h2 style={styles[`${isMobile ? "p" : "l"}_title`]}>
          {heading!==""?heading:isGame?`Game ID: ${gameId}`:`Hi , ${name}`}
        </h2>
      </div>

      <div
        style={styles[`${isMobile ? "p" : "l"}_menuContainer`]}
        onClick={onMenuClick}
      >
        <img src={hamburgarg} alt="menu" />
      </div>

      {/* Balance */}
      <div style={styles[`${isMobile ? "p" : "l"}_balanceContainer`]}>
        <h2 style={styles[`${isMobile ? "p" : "l"}_balanceText`]}>
          {userBalance.toFixed(2)}
        </h2>
        <img
        onClick={messageFromWallet}
          src={plusIcon}
          alt="menu"
          style={styles[`${isMobile ? "p" : "l"}_plusIcon`]}
        />
      </div>
      
    </div>
  );
}
