SUNWAIT = sunwait
SHC = shc
MERCURY236 = mercury236

.PHONY: build

build:
	$(MAKE) -C $(MERCURY236)
	$(MAKE) -C $(SUNWAIT)
	$(MAKE) -C $(SHC)
	cp $(MERCURY236)/mercury236 $(SHC)/bin
	cp $(SUNWAIT)/sunwait $(SHC)/bin

clean:
	$(MAKE) -C $(SUNWAIT) clean
	$(MAKE) -C $(SHC) clean
	$(MAKE) -C $(MERCURY236) clean
