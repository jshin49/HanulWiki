HanulWiki.Home = CLASS({

	preset : function() {
		'use strict';

		return VIEW;
	},

	init : function(inner, self) {
		'use strict';

		var
		// scroll store
		scrollStore = HanulWiki.STORE('scroll'),
		
		// is manually scroll
		isManuallyScroll = false,
		
		// scroll event
		scrollEvent = EVENT('scroll', function() {
			
			if (isManuallyScroll === true) {
				isManuallyScroll = false;
			} else {
			
				scrollStore.save({
					name : 'top',
					value : SCROLL_TOP(),
					isToSession : true
				});
			}
		}),
		
		// browser info
		browserInfo = INFO.getBrowserInfo(),
		
		// article room
		articleRoom = HanulWiki.ROOM('Article'),
		
		// popular list
		popularList,
		
		// recent list
		recentList,
		
		// recent update list
		recentUpdateList,
		
		// wrapper
		wrapper = DIV({
			c : [DIV({
				style : {
					marginRight : 10,
					marginBottom : 10,
					flt : 'left',
					border : '1px solid #ccc',
					onDisplayResize : function(width, height) {
						return {
							width : width >= 1024 ? 300 : '100%'
						};
					}
				},
				c : [H2({
					style : {
						backgroundColor : CONFIG.HanulWiki.baseColor,
						color : '#fff',
						fontWeight : 'bold',
						padding : 10,
						fontSize : 16,
						textAlign : 'center'
					},
					c : '인기글'
				}), popularList = DIV({
					style : {
						padding : 5
					},
					c : '로딩중...'
				})]
			}), DIV({
				style : {
					marginRight : 10,
					marginBottom : 10,
					flt : 'left',
					border : '1px solid #ccc',
					onDisplayResize : function(width, height) {
						return {
							width : width >= 1024 ? 300 : '100%'
						};
					}
				},
				c : [H2({
					style : {
						backgroundColor : CONFIG.HanulWiki.baseColor,
						color : '#fff',
						fontWeight : 'bold',
						padding : 10,
						fontSize : 16,
						textAlign : 'center'
					},
					c : '최신글'
				}), recentList = DIV({
					style : {
						padding : 5
					},
					c : '로딩중...'
				})]
			}), DIV({
				style : {
					marginBottom : 10,
					flt : 'left',
					border : '1px solid #ccc',
					onDisplayResize : function(width, height) {
						return {
							width : width >= 1024 ? 300 : '100%'
						};
					}
				},
				c : [H2({
					style : {
						backgroundColor : CONFIG.HanulWiki.baseColor,
						color : '#fff',
						fontWeight : 'bold',
						padding : 10,
						fontSize : 16,
						textAlign : 'center'
					},
					c : '최근 수정글'
				}), recentUpdateList = DIV({
					style : {
						padding : 5
					},
					c : '로딩중...'
				})]
			}), CLEAR_BOTH()]
		}).appendTo(HanulWiki.Layout.getContent()),
		
		// scroll to saved top.
		scrollToSavedTop = function() {
			if (scrollStore.get('top') !== undefined && scrollStore.get('top') !== SCROLL_TOP()) {
				isManuallyScroll = true;
				scrollTo(0, scrollStore.get('top'));
			}
		};
		
		TITLE(CONFIG.title);
		
		HanulWiki.ArticleModel.find({
			count : 20,
			sort : {
				viewCount : -1
			}
		}, function(articleDataSet) {
					
			popularList.empty();
			
			EACH(articleDataSet, function(articleData) {
				
				var
				// article link
				articleLink;
				
				if (inner.checkIsClosed() !== true) {
					
					popularList.append(DIV({
						style : {
							padding : 5
						},
						c : [articleLink = A({
							style : {
								color : CONFIG.HanulWiki.baseColor
							},
							c : articleData.id,
							href : HanulWiki.HREF(HanulWiki.escapeId(articleData.id)),
							on : {
								tap : function(e) {
									HanulWiki.GO(HanulWiki.escapeId(articleData.id));
								}
							}
						}), SPAN({
							style : {
								marginLeft : 5,
								fontSize : 10
							},
							c : '(' + articleData.viewCount + ')'
						})]
					}));
					
					GET({
						host : 'tagengine.btncafe.com',
						uri : '__REP_TAG',
						paramStr : 'tag=' + encodeURIComponent(articleData.id)
					}, function(id) {
						articleLink.empty();
						articleLink.append(id);
					});
					
					scrollToSavedTop();
				}
			});
		});
		
		HanulWiki.ArticleModel.onNewAndFind({
			count : 20
		}, {
			success : function() {
				if (inner.checkIsClosed() !== true) {
					recentList.empty();
					
					DELAY(function() {
						scrollToSavedTop();
					});
				}
			},
			handler : function(articleData) {
				
				var
				// article link
				articleLink;
				
				if (inner.checkIsClosed() !== true) {
					
					if (recentList.getChildren().length === 20) {
						recentList.getChildren()[19].remove();
					}
					
					recentList.prepend(DIV({
						style : { 
							padding : 5
						},
						c : [articleLink = A({
							style : {
								color : CONFIG.HanulWiki.baseColor
							},
							c : articleData.id,
							href : HanulWiki.HREF(HanulWiki.escapeId(articleData.id)),
							on : {
								tap : function(e) {
									HanulWiki.GO(HanulWiki.escapeId(articleData.id));
								}
							}
						}), SPAN({
							style : {
								marginLeft : 5,
								fontSize : 10
							},
							c : '(' + articleData.viewCount + ')'
						})]
					}));
					
					GET({
						host : 'tagengine.btncafe.com',
						uri : '__REP_TAG',
						paramStr : 'tag=' + encodeURIComponent(articleData.id)
					}, function(id) {
						articleLink.empty();
						articleLink.append(id);
					});
				}
			}
		});
		
		HanulWiki.ArticleModel.find({
			count : 20,
			sort : {
				lastUpdateTime : -1
			}
		}, function(articleDataSet) {
			
			var
			// create article dom.
			createArticleDom = function(articleData) {
				
				var
				// article link
				articleLink,
				
				// article dom
				articleDom = DIV({
					style : {
						padding : 5
					},
					c : [articleLink = A({
						style : {
							color : CONFIG.HanulWiki.baseColor
						},
						c : articleData.id,
						href : HanulWiki.HREF(HanulWiki.escapeId(articleData.id)),
						on : {
							tap : function(e) {
								HanulWiki.GO(HanulWiki.escapeId(articleData.id));
							}
						}
					}), SPAN({
						style : {
							marginLeft : 5,
							fontSize : 10
						},
						c : '(' + articleData.viewCount + ')'
					})]
				});
				
				GET({
					host : 'tagengine.btncafe.com',
					uri : '__REP_TAG',
					paramStr : 'tag=' + encodeURIComponent(articleData.id)
				}, function(id) {
					articleLink.empty();
					articleLink.append(id);
				});
				
				return articleDom;
			};
					
			recentUpdateList.empty();
			
			EACH(articleDataSet, function(articleData) {
				
				if (inner.checkIsClosed() !== true) {
					
					recentUpdateList.append(createArticleDom(articleData));
					
					scrollToSavedTop();
				}
			});
			
			if (articleRoom !== undefined) {
			
				articleRoom.on('recentUpdate', function(recentUpdateArticleData) {
					
					if (recentUpdateList.getChildren().length === 20) {
						recentUpdateList.getChildren()[19].remove();
					}
					
					recentUpdateList.prepend(createArticleDom(recentUpdateArticleData));
				});
			}
		});
		
		if (CONFIG.HanulWiki.mainDocument !== undefined) {
			
			HanulWiki.ArticleModel.get(CONFIG.HanulWiki.mainDocument, function(articleData) {
				
				var
				// content
				content,
				
				// change.
				change;
				
				wrapper.prepend(content = DIV({
					style : {
						border : '1px solid #ccc',
						padding : 10,
						fontSize : 14,
						margin : '10px 0 20px 0'
					}
				}));
				
				if (browserInfo.name === 'Internet Explorer' && browserInfo.version < 9) {
					content.append(articleData.content);
				} else {
					
					content.getEl().setAttribute('class', 'markdown-body');
					content.getEl().innerHTML = marked(articleData.content);
					
					change = function(el) {
						
						var
						// text content
						textContent,
						
						// cleaned content
						cleanedContent = '',
						
						// content index set
						contentIndexSet = [],
						
						// append count
						appendCount = 0,
						
						// new el
						newEl,
						
						// extras
						i, contentIndex;
						
						if (el.tagName !== 'A') {
							
							if (el.tagName === undefined) {
								
								textContent = el.textContent;
								
								EACH(el.textContent, function(ch, i) {
									if (ch !== ' ') {
										contentIndexSet[cleanedContent.length] = i;
										cleanedContent += ch.toLowerCase();
									}
								});
								
								for (i = 0; i <= contentIndexSet.length; i += 1) {
									contentIndex = contentIndexSet[i];
			
									EACH(articleData.keywords, function(keyword) {
										
										var
										// href
										href;
										
										if (cleanedContent.substring(i, i + keyword.length) === keyword) {
		
											textContent = textContent.substring(0, contentIndex + appendCount)
											+ '<a style="color: ' + CONFIG.HanulWiki.baseColor + ';" href="' + HanulWiki.escapeId(keyword) + '" onclick="HanulWiki.GO(\'' + HanulWiki.escapeId(keyword) + '\'); return false;">' + textContent.substring(contentIndex + appendCount, contentIndexSet[i + keyword.length - 1] + appendCount + 1) + '</a>'
											+ textContent.substring(contentIndexSet[i + keyword.length - 1] + appendCount + 1);
											
											appendCount += 32 + CONFIG.HanulWiki.baseColor.length + 42 + HanulWiki.escapeId(keyword).length * 2;
											i += keyword.length - 1;
											
											return false;
										}
									});
								}
								
								newEl = document.createElement('span');
								newEl.innerHTML = textContent;
								
								el.parentNode.insertBefore(newEl, el);
								el.parentNode.removeChild(el);
							
							} else {
								for (i = 0; i < el.childNodes.length; i += 1) {
									change(el.childNodes[i]);
								}
							}
						}
					};
					
					change(content.getEl());
					
					scrollToSavedTop();
				}
			});
		}
		
		scrollToSavedTop();
		
		TITLE(CONFIG.title);
		
		inner.on('close', function() {
			scrollEvent.remove();
			wrapper.remove();
			articleRoom.exit();
			articleRoom = undefined;
		});
	}
});
